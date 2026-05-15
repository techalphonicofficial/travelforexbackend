const BaseRepository = require('./BaseRepository');

class CityRepository extends BaseRepository {
    constructor(model, countryModel, continentModel) {
        super(model);
        this.countryModel = countryModel;
        this.continentModel = continentModel;
    }

    async findAll() {
        return this.model.findAll({
            include: [{
                model: this.countryModel, as: 'country', attributes: ['id', 'name'],
                include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
            }]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: [{
                model: this.countryModel, as: 'country', attributes: ['id', 'name'],
                include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
            }]
        });
    }

    async findByCountryId(countryId) {
        return this.model.findAll({ where: { country_id: countryId } });
    }

    async findPaginated(page = 1, limit = 20, search = '', continentId = '', countryId = '') {
        const offset = (page - 1) * limit;
        const whereClause = {};
        
        if (search) {
            const Op = this.model.sequelize.Sequelize.Op;
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        
        if (countryId) {
            whereClause.country_id = countryId;
        }

        const includeClause = [{
            model: this.countryModel, as: 'country', attributes: ['id', 'name'],
            include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
        }];

        if (continentId && !countryId) {
            includeClause[0].where = { continent_id: continentId };
        }

        return this.model.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: includeClause,
            order: [['name', 'ASC']]
        });
    }
}

module.exports = CityRepository;
