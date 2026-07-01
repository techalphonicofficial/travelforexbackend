const BaseRepository = require('./BaseRepository');
const { Op } = require('sequelize');

class CountryRepository extends BaseRepository {
    constructor(model, continentModel) {
        super(model);
        this.continentModel = continentModel;
    }

    async findAll() {
        return this.model.findAll({
            include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
        });
    }

    async findByContinentId(continentId) {
        return this.model.findAll({ where: { continent_id: continentId } });
    }
}

module.exports = CountryRepository;
