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
}

module.exports = DestinationRepository;
