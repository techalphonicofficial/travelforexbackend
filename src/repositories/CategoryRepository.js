const BaseRepository = require('./BaseRepository');

const { Op } = require('sequelize');

class CategoryRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async findAll() {
        return this.model.findAll({
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }

    async findForSelection() {
        return this.model.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
    }

    async findhome() {
        return this.model.findAll({
            where: {
                show_in_home: {
                    [Op.eq]: true
                }
            },
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }

    async findTourTypes() {
        return this.model.findAll({
            where: {
                is_tour_type: true
            },
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }

    async findMenuTourTypes() {
        return this.model.findAll({
            where: {
                is_tour_type: true,
                show_in_menu: true
            },
            include: [{
                association: 'packageCategories',
                attributes: ['id', 'title', 'slug', 'feature_image']
            }],
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC'],
                [{ model: this.model.sequelize.models.PackageCategory, as: 'packageCategories' }, 'title', 'ASC']
            ]
        });
    }
}

module.exports = CategoryRepository;
