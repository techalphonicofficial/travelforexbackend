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

    async findPaginated(page = 1, limit = 20, search = '', continentName = '', countryName = '') {
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
        const offset = (safePage - 1) * safeLimit;
        const whereClause = {};
        const Op = this.model.sequelize.Sequelize.Op;

        if (search) {
            const keyword = `%${String(search).trim()}%`;
            whereClause[Op.or] = [
                { name: { [Op.iLike]: keyword } },
                { '$country.name$': { [Op.iLike]: keyword } }
            ];
        }
        
        const countryWhere = {};
        if (countryName) {
            countryWhere.name = { [Op.iLike]: `%${countryName}%` };
        }

        const continentWhere = {};
        if (continentName) {
            continentWhere.name = { [Op.iLike]: `%${continentName}%` };
        }

        const includeClause = [{
            model: this.countryModel, 
            as: 'country', 
            attributes: ['id', 'name'],
            where: Object.keys(countryWhere).length > 0 ? countryWhere : undefined,
            required: Object.keys(countryWhere).length > 0 || Object.keys(continentWhere).length > 0,
            include: [{ 
                model: this.continentModel, 
                as: 'continent', 
                attributes: ['id', 'name'],
                where: Object.keys(continentWhere).length > 0 ? continentWhere : undefined,
                required: Object.keys(continentWhere).length > 0
            }]
        }];

        return this.model.findAndCountAll({
            where: whereClause,
            limit: safeLimit,
            offset: parseInt(offset),
            include: includeClause,
            order: [['name', 'ASC'], ['id', 'ASC']],
            distinct: true,
            subQuery: false
        });
    }
}

module.exports = CityRepository;
