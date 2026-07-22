const BaseRepository = require('./BaseRepository');

class DestinationRepository extends BaseRepository {
    constructor(model, categoryModel, mappingModel, mediaModel, cityModel, countryModel, continentModel, packageModel) {
        super(model);
        this.categoryModel = categoryModel;
        this.mappingModel = mappingModel;
        this.mediaModel = mediaModel;
        this.cityModel = cityModel;
        this.countryModel = countryModel;
        this.continentModel = continentModel;
        this.packageModel = packageModel;
    }

    async findAll() {
        return this.model.findAll({
            include: [
                { model: this.categoryModel, as: 'categories', through: { attributes: [] } },
                { model: this.mediaModel, as: 'gallery' },
                {
                    model: this.mappingModel, as: 'mappings',
                    include: [
                        {
                            model: this.cityModel, as: 'city',
                            include: [{ 
                                model: this.countryModel, as: 'country',
                                include: [{ model: this.continentModel, as: 'continent' }]
                            }]
                        }
                    ]
                },
                { 
                    model: this.packageModel, 
                    as: 'packages', 
                    through: { attributes: [] },
                    include: [
                        { model: this.mediaModel, as: 'gallery' }
                    ]
                }
            ]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: [
                { model: this.categoryModel, as: 'categories', through: { attributes: [] } },
                { model: this.mediaModel, as: 'gallery' },
                {
                    model: this.mappingModel, as: 'mappings',
                    include: [
                        {
                            model: this.cityModel, as: 'city',
                            include: [{ 
                                model: this.countryModel, as: 'country',
                                include: [{ model: this.continentModel, as: 'continent' }]
                            }]
                        }
                    ]
                },
                { 
                    model: this.packageModel, 
                    as: 'packages', 
                    through: { attributes: [] },
                    include: [
                        { model: this.mediaModel, as: 'gallery' }
                    ]
                }
            ]
        });
    }

    async findBySlug(slug) {
        return this.model.findOne({
            where: { slug: slug },
            include: [
                { model: this.categoryModel, as: 'categories', through: { attributes: [] } },
                { model: this.mediaModel, as: 'gallery' },
                {
                    model: this.mappingModel, as: 'mappings',
                    include: [
                        {
                            model: this.cityModel, as: 'city',
                            include: [{ 
                                model: this.countryModel, as: 'country',
                                include: [{ model: this.continentModel, as: 'continent' }]
                            }]
                        }
                    ]
                },
                { 
                    model: this.packageModel, 
                    as: 'packages', 
                    through: { attributes: [] },
                    include: [
                        { model: this.mediaModel, as: 'gallery' }
                    ]
                }
            ]
        });
    }

    async findByCategory(categoryId) {
        return this.model.findAll({
            include: [
                {
                    model: this.categoryModel,
                    as: 'categories',
                    where: { id: categoryId },
                    through: { attributes: [] }
                },
                { model: this.mediaModel, as: 'gallery' }
            ]
        });
    }

    async findTrending() {
        return this.model.findAll({
            where: { is_trending: true },
            include: [
                { model: this.mediaModel, as: 'gallery', separate: true, limit: 1 },
                {
                    model: this.mappingModel, as: 'mappings',
                    include: [
                        {
                            model: this.cityModel, as: 'city',
                            include: [{ 
                                model: this.countryModel, as: 'country',
                                include: [{ model: this.continentModel, as: 'continent' }]
                            }]
                        }
                    ]
                }
            ]
        });
    }

    async findVisaFree() {
        return this.model.findAll({
            where: { is_visa_free: true },
            include: [
                { model: this.mediaModel, as: 'gallery', separate: true, limit: 1 },
                {
                    model: this.mappingModel, as: 'mappings',
                    include: [
                        {
                            model: this.cityModel, as: 'city',
                            include: [{ 
                                model: this.countryModel, as: 'country',
                                include: [{ model: this.continentModel, as: 'continent' }]
                            }]
                        }
                    ]
                }
            ]
        });
    }

    async findCustomizable() {
        const { Op } = require('sequelize');
        return this.model.findAll({
            where: {
                [Op.or]: [
                    { is_customizable: true },
                    { customize: true }
                ]
            },
            order: [['name', 'ASC']],
            include: [
                { model: this.mediaModel, as: 'gallery', separate: true, limit: 1 },
                { model: this.categoryModel, as: 'categories', through: { attributes: [] } }
            ]
        });
    }

    async findRelatedPackagesBySlug(slug, { page = 1, limit = 10 } = {}) {
        const destination = await this.model.findOne({
            where: { slug },
            attributes: ['id', 'name', 'slug']
        });

        if (!destination) return null;

        const PackageDestination = this.model.sequelize.models.PackageDestination;
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const offset = (safePage - 1) * safeLimit;

        const result = await this.packageModel.findAndCountAll({
            where: { status: true },
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    required: true,
                    where: { destination_id: destination.id },
                    attributes: { exclude: ['activities'] },
                    include: [{
                        model: this.model,
                        as: 'destination',
                        attributes: ['id', 'name', 'slug', 'country', 'state']
                    }]
                },
                { model: this.mediaModel, as: 'gallery', required: false },
                { association: 'package_categories', required: false }
            ],
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
            limit: safeLimit,
            offset,
            distinct: true
        });

        return {
            destination,
            packages: result.rows,
            total: result.count,
            currentPage: safePage,
            totalPages: Math.ceil(result.count / safeLimit),
            limit: safeLimit
        };
    }

    async deleteMany(ids) {
        return this.model.destroy({ where: { id: ids } });
    }
}

module.exports = DestinationRepository;
