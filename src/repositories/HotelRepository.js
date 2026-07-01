class HotelRepository {
    constructor(Hotel) {
        this.Hotel = Hotel;
    }

    normalizeText(value) {
        return String(value || '').trim();
    }

    normalizePaging(page = 1, limit = 20) {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        return {
            page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
            limit: Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20
        };
    }

    async getDestinationMatches(filters = {}) {
        const { Destination, DestinationMapping, City, Country } = this.Hotel.sequelize.models;
        const search = this.normalizeText(filters.search).toLowerCase();
        const country = this.normalizeText(filters.country).toLowerCase();
        const city = this.normalizeText(filters.city).toLowerCase();

        if (!Destination || (!search && !country && !city)) return [];

        const include = DestinationMapping && City ? [{
            model: DestinationMapping,
            as: 'mappings',
            required: false,
            include: [{
                model: City,
                as: 'city',
                required: false,
                include: Country ? [{ model: Country, as: 'country', required: false }] : []
            }]
        }] : [];

        const destinations = await Destination.findAll({ include });

        return destinations
            .filter(destination => {
                const plain = destination.get({ plain: true });
                const mappings = Array.isArray(plain.mappings) ? plain.mappings : [];
                const cityNames = mappings.map(mapping => mapping.city && mapping.city.name).filter(Boolean);
                const countryNames = [
                    plain.country,
                    ...mappings.map(mapping => mapping.city && mapping.city.country && mapping.city.country.name)
                ].filter(Boolean);

                if (country && !countryNames.some(name => String(name).toLowerCase() === country)) return false;
                if (city) {
                    const destinationName = this.normalizeText(plain.name).toLowerCase();
                    const hasCity = cityNames.some(name => String(name).toLowerCase() === city);
                    if (!hasCity && destinationName !== city) return false;
                }

                if (!search) return true;

                const searchableValues = [
                    plain.name,
                    plain.country,
                    ...cityNames,
                    ...countryNames
                ].filter(Boolean).map(value => String(value).toLowerCase());

                return searchableValues.some(value => value.includes(search));
            })
            .map(destination => destination.id);
    }

    async findPaginated(filters = {}) {
        const Op = this.Hotel.sequelize.Sequelize.Op;
        const { Destination, Media } = this.Hotel.sequelize.models;
        const { page, limit } = this.normalizePaging(filters.page, filters.limit);
        const search = this.normalizeText(filters.search);
        const destinationId = parseInt(filters.destination_id || filters.destinationId, 10);
        const locationFiltered = Boolean(this.normalizeText(filters.country) || this.normalizeText(filters.city));
        const destinationSearchIds = await this.getDestinationMatches({
            search,
            country: filters.country,
            city: filters.city
        });

        const where = {};
        const andConditions = [];

        if (Number.isInteger(destinationId) && destinationId > 0) {
            andConditions.push({ destination_id: destinationId });
        }

        if (locationFiltered) {
            andConditions.push({ destination_id: { [Op.in]: destinationSearchIds } });
        }

        if (search) {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { provider_name: { [Op.iLike]: `%${search}%` } },
                    { destination_id: { [Op.in]: destinationSearchIds } }
                ]
            });
        }

        if (andConditions.length) {
            where[Op.and] = andConditions;
        }

        const include = [];
        if (Destination) {
            include.push({
                model: Destination,
                as: 'destination',
                attributes: ['id', 'name', 'slug', 'country', 'state'],
                required: false
            });
        }

        if (Media) {
            include.push({
                model: Media,
                as: 'gallery',
                attributes: ['id', 'url', 'media_type', 'alt_text', 'is_primary'],
                required: false
            });
        }

        const result = await this.Hotel.findAndCountAll({
            where,
            include,
            distinct: true,
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            count: result.count,
            rows: result.rows,
            pagination: {
                page,
                limit,
                total: result.count,
                totalPages: Math.max(1, Math.ceil(result.count / limit))
            }
        };
    }

    async findAll() {
        return await this.Hotel.findAll();
    }

    async findByDestination(destinationId) {
        return await this.Hotel.findAll({ where: { destination_id: destinationId } });
    }

    async findById(id) {
        return await this.Hotel.findByPk(id);
    }

    async create(data) {
        return await this.Hotel.create(data);
    }

    async update(id, data) {
        const hotel = await this.findById(id);
        if (hotel) {
            return await hotel.update(data);
        }
        return null;
    }

    async delete(id) {
        const hotel = await this.findById(id);
        if (hotel) {
            await hotel.destroy();
            return true;
        }
        return false;
    }
}

module.exports = HotelRepository;
