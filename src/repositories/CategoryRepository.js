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
                is_tour_type: {
                    [Op.eq]: true
                }
            },
            order: [
                ['sort_order', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }
}

module.exports = CategoryRepository;
