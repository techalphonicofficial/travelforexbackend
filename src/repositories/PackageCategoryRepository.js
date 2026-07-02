const BaseRepository = require('./BaseRepository');

class PackageCategoryRepository extends BaseRepository {
    constructor(model, categoryModel) {
        super(model);
        this.categoryModel = categoryModel;
    }

    async findAll() {
        return this.model.findAll({
            order: [['title', 'ASC']],
            include: this.categoryModel ? [{
                model: this.categoryModel,
                as: 'category',
                attributes: ['id', 'name']
            }] : []
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: this.categoryModel ? [{
                model: this.categoryModel,
                as: 'category',
                attributes: ['id', 'name']
            }] : []
        });
    }
}

module.exports = PackageCategoryRepository;
