const BaseRepository = require('./BaseRepository');
const { Op } = require('sequelize');

class PackageRepository extends BaseRepository {
    constructor(model, destinationModel, activityModel, mediaModel, inclusionModel, exclusionModel, packageDestinationModel, reviewModel = null, highlightModel = null) {
        super(model);
        this.destinationModel = destinationModel;
        this.activityModel = activityModel;
        this.mediaModel = mediaModel;
        this.inclusionModel = inclusionModel;
        this.exclusionModel = exclusionModel;
        this.packageDestinationModel = packageDestinationModel;
        this.reviewModel = reviewModel;
        this.highlightModel = highlightModel;
    }

    normalizeHighlights(value) {
        if (!Array.isArray(value)) return [];
        return [...new Set(value
            .map(item => String(item && typeof item === 'object' ? (item.content || item.text || '') : item || '').trim())
            .filter(Boolean))];
    }

    highlightInclude() {
        if (!this.highlightModel) return [];
        return [{
            model: this.highlightModel,
            as: 'highlights',
            separate: true,
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
        }];
    }

    destinationLocationInclude({ required = false, city = null, country = null, continent = null } = {}) {
        const countryInclude = {
            association: 'country',
            required: Boolean(country || continent)
        };
        if (country) {
            countryInclude.where = {
                [Op.or]: [
                    { id: isNaN(country) ? -1 : country },
                    { name: { [Op.iLike]: `%${country}%` } }
                ]
            };
        }
        if (continent) {
            countryInclude.include = [{
                association: 'continent',
                required: true,
                where: {
                    [Op.or]: [
                        { id: isNaN(continent) ? -1 : continent },
                        { name: { [Op.iLike]: `%${continent}%` } }
                    ]
                }
            }];
        }

        const cityInclude = {
            association: 'city',
            required: Boolean(required || city || country || continent),
            include: [countryInclude]
        };
        if (city) {
            cityInclude.where = {
                [Op.or]: [
                    { id: isNaN(city) ? -1 : city },
                    { name: { [Op.iLike]: `%${city}%` } }
                ]
            };
        }

        return {
            association: 'mappings',
            required: Boolean(required || city || country || continent),
            include: [cityInclude]
        };
    }

    async create(data) {
        const payload = { ...data };
        const hasHighlights = Object.prototype.hasOwnProperty.call(payload, 'highlights');
        const highlights = this.normalizeHighlights(payload.highlights);
        delete payload.highlights;
        const requestedSortOrder = parseInt(payload.sort_order, 10);
        if (!Number.isInteger(requestedSortOrder) || requestedSortOrder < 0) {
            const maxSortOrder = parseInt(await this.model.max('sort_order'), 10) || 0;
            payload.sort_order = maxSortOrder + 1;
        } else {
            payload.sort_order = requestedSortOrder;
        }
        if (!this.highlightModel || !hasHighlights) return this.model.create(payload);

        const transaction = await this.model.sequelize.transaction();
        try {
            const pkg = await this.model.create(payload, { transaction });
            if (highlights.length) {
                await this.highlightModel.bulkCreate(highlights.map((content, index) => ({
                    package_id: pkg.id,
                    content,
                    sort_order: index + 1
                })), { transaction });
            }
            await transaction.commit();
            return this.model.findByPk(pkg.id, { include: this.highlightInclude() });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id, data) {
        const payload = { ...data };
        const hasHighlights = Object.prototype.hasOwnProperty.call(payload, 'highlights');
        const highlights = this.normalizeHighlights(payload.highlights);
        delete payload.highlights;

        const transaction = await this.model.sequelize.transaction();
        try {
            const pkg = await this.model.findByPk(id, { transaction });
            if (!pkg) {
                await transaction.rollback();
                return null;
            }
            await pkg.update(payload, { transaction });
            if (this.highlightModel && hasHighlights) {
                await this.highlightModel.destroy({ where: { package_id: id }, transaction });
                if (highlights.length) {
                    await this.highlightModel.bulkCreate(highlights.map((content, index) => ({
                        package_id: id,
                        content,
                        sort_order: index + 1
                    })), { transaction });
                }
            }
            await transaction.commit();
            return this.model.findByPk(id, {
                include: this.highlightInclude()
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    reviewInclude() {
        if (!this.reviewModel) return [];

        return [{
            model: this.reviewModel,
            as: 'reviews',
            required: false,
            separate: true,
            where: { status: 'approved' },
            include: [{
                model: this.mediaModel,
                as: 'media',
                required: false,
                separate: true,
                order: [
                    ['is_primary', 'DESC'],
                    ['id', 'ASC']
                ]
            }],
            order: [['created_at', 'DESC']]
        }];
    }

    async findAll({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            include: [
                { 
                    model: this.packageDestinationModel,
                    as: 'destinations',
                    attributes: { exclude: ['activities'] },
                    include: [{ model: this.destinationModel, as: 'destination', include: [this.destinationLocationInclude()] }]
                },
                { model: this.mediaModel, as: 'gallery' },
                ...this.highlightInclude(),
                { association: 'package_categories' }
            ],
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
    }

    requiredPaginationIncludes(includes = []) {
        return includes.map(include => {
            const nestedIncludes = this.requiredPaginationIncludes(include.include || []);
            if (!include.required && nestedIncludes.length === 0) return null;

            const paginationInclude = {
                ...include,
                attributes: [],
                required: Boolean(include.required || nestedIncludes.length)
            };

            if (nestedIncludes.length) paginationInclude.include = nestedIncludes;
            else delete paginationInclude.include;

            if (include.through || ['categories', 'package_categories'].includes(include.association)) {
                paginationInclude.through = { ...(include.through || {}), attributes: [] };
            }

            return paginationInclude;
        }).filter(Boolean);
    }

    async filterPackages({ page = 1, limit = 10, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug, package_type, travel_type }) {
        const where = {};
        const requestedPackageType = String(package_type || travel_type || '').trim().toLowerCase();
        if (['domestic', 'international'].includes(requestedPackageType)) {
            where.travel_type = requestedPackageType;
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }
        if (duration) {
            where.duration_days = duration;
        }

        const destIncludeOptions = {
            model: this.destinationModel, 
            as: 'destination',
            required: false
        };

        if (destination) {
            destIncludeOptions.where = {
                [Op.or]: [
                    { id: isNaN(destination) ? -1 : destination },
                    { slug: destination }
                ]
            };
            destIncludeOptions.required = true;
        }

        const nestedIncludes = [];
        
        if (city || country || continent) {
            nestedIncludes.push(this.destinationLocationInclude({ required: true, city, country, continent }));
            destIncludeOptions.required = true;
        } else {
            nestedIncludes.push(this.destinationLocationInclude());
        }

        if (category) {
            nestedIncludes.push({
                association: 'categories',
                required: true,
                where: {
                    [Op.or]: [
                        { id: isNaN(category) ? -1 : category },
                        { slug: category },
                        { name: { [Op.iLike]: `%${category}%` } }
                    ]
                }
            });
            destIncludeOptions.required = true;
        }

        if (nestedIncludes.length > 0) {
            destIncludeOptions.include = nestedIncludes;
        }

        const pkgDestInclude = {
            model: this.packageDestinationModel, as: 'destinations',
            include: [destIncludeOptions],
            required: destIncludeOptions.required
        };

        let packageCategoryInclude = {
            association: 'package_categories'
        };

        if (package_category_slug) {
            packageCategoryInclude.required = true;
            packageCategoryInclude.where = { slug: package_category_slug };
        }

        let includes = [
            pkgDestInclude,
            { model: this.mediaModel, as: 'gallery' },
            ...this.highlightInclude(),
            packageCategoryInclude
        ];

        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const offset = (safePage - 1) * safeLimit;
        const paginationIncludes = this.requiredPaginationIncludes(includes);

        const count = await this.model.count({
            where,
            include: paginationIncludes,
            distinct: true,
            col: 'id'
        });

        const pageRows = await this.model.findAll({
            where,
            attributes: ['id'],
            include: paginationIncludes,
            subQuery: false,
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
            group: ['Package.id'],
            limit: safeLimit,
            offset
        });

        const packageIds = pageRows.map(row => row.id);
        if (!packageIds.length) return { count, rows: [] };

        const rows = await this.model.findAll({
            where: {
                ...where,
                id: { [Op.in]: packageIds }
            },
            include: includes,
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });

        return { count, rows };
    }

    normalizeFilter(value) {
        return String(value || '').trim().toLowerCase();
    }

    parseAmount(value, fallback = null) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    durationBuckets() {
        return [
            { key: '1-3', label: '1-3 days', min: 1, max: 3 },
            { key: '4-7', label: '4-7 days', min: 4, max: 7 },
            { key: '8-14', label: '8-14 days', min: 8, max: 14 },
            { key: '15-plus', label: '15+ days', min: 15, max: null }
        ];
    }

    packageText(row = {}) {
        const parts = [row.name, row.slug];
        (row.destinations || []).forEach(packageDestination => {
            const destination = packageDestination.destination || {};
            parts.push(destination.name, destination.slug, destination.country, destination.state);
            (destination.categories || []).forEach(category => parts.push(category.name, category.slug));
            (destination.mappings || []).forEach(mapping => {
                const city = mapping.city || {};
                const country = city.country || {};
                const continent = country.continent || {};
                parts.push(city.name, country.name, continent.name);
            });
        });
        return parts.filter(Boolean).join(' ').toLowerCase();
    }

    packageTourTypes(row = {}) {
        const byId = new Map();
        (row.destinations || []).forEach(packageDestination => {
            const destination = packageDestination.destination || {};
            (destination.categories || []).forEach(category => {
                if (!category.is_tour_type) return;
                byId.set(category.id, category);
            });
        });
        return [...byId.values()];
    }

    packageMatchesDuration(row = {}, duration = '') {
        const normalized = this.normalizeFilter(duration);
        if (!normalized || normalized === 'any') return true;
        const days = parseInt(row.duration_days, 10) || 0;
        const bucket = this.durationBuckets().find(item => item.key === normalized);
        if (bucket) {
            return days >= bucket.min && (bucket.max === null || days <= bucket.max);
        }
        const exactDays = parseInt(duration, 10);
        return Number.isInteger(exactDays) && exactDays > 0 ? days === exactDays : true;
    }

    packageMatchesTourType(row = {}, category = '') {
        const normalized = this.normalizeFilter(category);
        if (!normalized || normalized === 'all') return true;
        return this.packageTourTypes(row).some(tourType => (
            String(tourType.id) === normalized ||
            this.normalizeFilter(tourType.slug) === normalized ||
            this.normalizeFilter(tourType.name) === normalized
        ));
    }

    packageMatchesFilters(row = {}, filters = {}, exclude = '') {
        const search = this.normalizeFilter(filters.search || filters.q);
        const city = this.normalizeFilter(filters.city);
        const country = this.normalizeFilter(filters.country);
        const continent = this.normalizeFilter(filters.continent);
        const destination = this.normalizeFilter(filters.destination);
        const tourType = filters.tour_type || filters.tourType || filters.category;
        const minPrice = this.parseAmount(filters.minPrice !== undefined ? filters.minPrice : filters.min_price);
        const maxPrice = this.parseAmount(filters.maxPrice !== undefined ? filters.maxPrice : filters.max_price);
        const price = this.parseAmount(row.price, 0);
        const text = this.packageText(row);

        if (exclude !== 'search' && search && !text.includes(search)) return false;
        if (exclude !== 'city' && city && !text.includes(city)) return false;
        if (exclude !== 'country' && country && !text.includes(country)) return false;
        if (exclude !== 'continent' && continent && !text.includes(continent)) return false;
        if (exclude !== 'destination' && destination && !text.includes(destination)) return false;
        if (exclude !== 'tour_type' && !this.packageMatchesTourType(row, tourType)) return false;
        if (exclude !== 'price') {
            if (minPrice !== null && price < minPrice) return false;
            if (maxPrice !== null && price > maxPrice) return false;
        }
        if (exclude !== 'duration' && !this.packageMatchesDuration(row, filters.duration)) return false;

        return true;
    }

    async getDynamicFilters(filters = {}) {
        const Category = this.model.sequelize.models.Category;
        const Country = this.model.sequelize.models.Country;

        const rows = await this.model.findAll({
            where: { status: true },
            attributes: ['id', 'name', 'slug', 'price', 'duration_days'],
            include: [{
                model: this.packageDestinationModel,
                as: 'destinations',
                attributes: ['destination_id'],
                required: false,
                include: [{
                    model: this.destinationModel,
                    as: 'destination',
                    attributes: ['id', 'name', 'slug', 'country', 'state'],
                    required: false,
                    include: [
                        {
                            association: 'categories',
                            attributes: ['id', 'name', 'slug', 'is_tour_type', 'sort_order'],
                            through: { attributes: [] },
                            required: false
                        },
                        {
                            association: 'mappings',
                            attributes: ['city_id'],
                            required: false,
                            include: [{
                                association: 'city',
                                attributes: ['id', 'name', 'country_id'],
                                required: false,
                                include: Country ? [{
                                    model: Country,
                                    as: 'country',
                                    attributes: ['id', 'name'],
                                    required: false,
                                    include: [{ association: 'continent', attributes: ['id', 'name'], required: false }]
                                }] : []
                            }]
                        }
                    ]
                }]
            }]
        });

        const packages = rows.map(row => row.get ? row.get({ plain: true }) : row);
        const current = packages.filter(row => this.packageMatchesFilters(row, filters));
        const withoutTourType = packages.filter(row => this.packageMatchesFilters(row, filters, 'tour_type'));
        const withoutPrice = packages.filter(row => this.packageMatchesFilters(row, filters, 'price'));
        const withoutDuration = packages.filter(row => this.packageMatchesFilters(row, filters, 'duration'));

        const rawSelectedTourType = this.normalizeFilter(filters.tour_type || filters.tourType || filters.category);
        const selectedTourType = rawSelectedTourType === 'all' ? '' : rawSelectedTourType;
        const tourTypeCountMap = new Map();
        withoutTourType.forEach(row => {
            this.packageTourTypes(row).forEach(tourType => {
                const countRow = tourTypeCountMap.get(tourType.id) || { ...tourType, count: 0 };
                countRow.count += 1;
                tourTypeCountMap.set(tourType.id, countRow);
            });
        });

        let tourTypes = [...tourTypeCountMap.values()];
        if (Category) {
            const categoryOrder = await Category.findAll({
                where: { is_tour_type: true },
                attributes: ['id', 'name', 'slug', 'sort_order'],
                order: [['sort_order', 'ASC'], ['name', 'ASC']]
            });
            const orderedIds = categoryOrder.map(category => category.id);
            const missing = categoryOrder
                .filter(category => !tourTypeCountMap.has(category.id))
                .map(category => ({ ...(category.get ? category.get({ plain: true }) : category), count: 0 }));
            tourTypes = [...tourTypes, ...missing].sort((a, b) => {
                const aIndex = orderedIds.indexOf(a.id);
                const bIndex = orderedIds.indexOf(b.id);
                if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 9999 : aIndex) - (bIndex === -1 ? 9999 : bIndex);
                return String(a.name).localeCompare(String(b.name));
            });
        } else {
            tourTypes.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        }

        const prices = withoutPrice
            .map(row => this.parseAmount(row.price, 0))
            .filter(value => value !== null && value >= 0);
        const minAvailablePrice = prices.length ? Math.min(...prices) : 0;
        const maxAvailablePrice = prices.length ? Math.max(...prices) : 0;
        const selectedMin = this.parseAmount(filters.minPrice !== undefined ? filters.minPrice : filters.min_price, minAvailablePrice);
        const selectedMax = this.parseAmount(filters.maxPrice !== undefined ? filters.maxPrice : filters.max_price, maxAvailablePrice);

        const selectedDuration = this.normalizeFilter(filters.duration);
        const durationOptions = this.durationBuckets().map(bucket => ({
            ...bucket,
            count: withoutDuration.filter(row => {
                const days = parseInt(row.duration_days, 10) || 0;
                return days >= bucket.min && (bucket.max === null || days <= bucket.max);
            }).length,
            selected: selectedDuration === bucket.key
        }));

        return {
            search: {
                query: filters.search || filters.q || '',
                placeholder: 'Destination, country...'
            },
            total: current.length,
            tour_types: [
                {
                    key: 'all',
                    label: 'All',
                    count: withoutTourType.length,
                    selected: !selectedTourType
                },
                ...tourTypes.map(tourType => ({
                    id: tourType.id,
                    name: tourType.name,
                    slug: tourType.slug,
                    label: tourType.name,
                    count: tourType.count || 0,
                    selected: Boolean(selectedTourType && (
                        selectedTourType === String(tourType.id) ||
                        selectedTourType === this.normalizeFilter(tourType.slug) ||
                        selectedTourType === this.normalizeFilter(tourType.name)
                    ))
                }))
            ],
            price_range: {
                min: minAvailablePrice,
                max: maxAvailablePrice,
                selected_min: selectedMin,
                selected_max: selectedMax
            },
            durations: [
                {
                    key: 'any',
                    label: 'Any',
                    min: null,
                    max: null,
                    count: withoutDuration.length,
                    selected: !selectedDuration || selectedDuration === 'any'
                },
                ...durationOptions
            ]
        };
    }
async findBySlug(slug) {
    return this.model.findOne({
        where: { slug },

        include: [
            {
                model: this.packageDestinationModel,
                as: 'destinations',
                include: [
                    {
                        model: this.destinationModel,
                        as: 'destination',
                        include: [this.destinationLocationInclude()]
                    }
                ]
            },
            {
                model: this.inclusionModel,
                as: 'inclusions'
            },
            {
                model: this.exclusionModel,
                as: 'exclusions'
            },
            ...this.highlightInclude(),
            {
                model: this.mediaModel,
                as: 'gallery'
            },
            ...this.reviewInclude()
        ],

        order: [
            [
                { model: this.packageDestinationModel, as: 'destinations' },
                'order',
                'ASC'
            ]
        ]
    });
}
    async findById(id) {
        return this.model.findByPk(id, {
            include: [
                {
                    model: this.packageDestinationModel, as: 'destinations',
                    include: [
                        { model: this.destinationModel, as: 'destination', include: [this.destinationLocationInclude()] }
                    ]
                },
                { model: this.inclusionModel, as: 'inclusions' },
                { model: this.exclusionModel, as: 'exclusions' },
                ...this.highlightInclude(),
                { model: this.mediaModel, as: 'gallery' },
                ...this.reviewInclude()
            ],
            order: [
                [{ model: this.packageDestinationModel, as: 'destinations' }, 'order', 'ASC']
            ]
        });
    }

    async delete(id) {
        const pkg = await this.model.findByPk(id);
        if (!pkg) return null;

        // Cascade delete is handled by DB 'ON DELETE CASCADE' for the most part,
        // but we manually cleanup media gallery which is polymorphic.
        if (this.mediaModel) {
            await this.mediaModel.destroy({ where: { entity_id: id, entity_type: 'package' } });
            
            // For day-level media, it's more complex since we need day IDs.
            // However, the migration doesn't strictly define Day IDs for media yet in this overhaul.
            // If needed, we could fetch all destinations -> days -> dayIds and destroy media.
        }

        return pkg.destroy();
    }

    async findByDestinationSlug(slug) {
        return this.model.findAll({
            include: [
                {
                    model: this.packageDestinationModel,
                    as: 'destinations',
                    required: true,
                    include: [{ 
                        model: this.destinationModel, 
                        as: 'destination',
                        where: { slug: slug },
                        required: true,
                        include: [this.destinationLocationInclude()]
                    }]
                },
                { model: this.mediaModel, as: 'gallery' },
                ...this.highlightInclude()
            ],
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });
    }
}

module.exports = PackageRepository;
