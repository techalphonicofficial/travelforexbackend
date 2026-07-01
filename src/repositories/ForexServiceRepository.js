const BaseRepository = require('./BaseRepository');

class ForexServiceRepository extends BaseRepository {
    constructor(model, countryModel, continentModel) {
        super(model);
        this.countryModel = countryModel;
        this.continentModel = continentModel;
    }

    includeCountry() {
        return [{
            model: this.countryModel,
            as: 'country',
            attributes: ['id', 'name', 'continent_id'],
            include: [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
        }];
    }

    async findAll() {
        return this.model.findAll({
            include: this.includeCountry(),
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: this.includeCountry()
        });
    }

    async findByCountryId(countryId) {
        return this.model.findAll({
            where: { country_id: countryId },
            include: this.includeCountry(),
            order: [['created_at', 'DESC']]
        });
    }

    async deleteMany(ids) {
        return this.model.destroy({ where: { id: ids } });
    }
}

module.exports = ForexServiceRepository;
