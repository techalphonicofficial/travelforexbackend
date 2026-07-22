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

    async delete(id) {
        const numericId = parseInt(id, 10);
        if (!Number.isInteger(numericId) || numericId < 1) return null;

        const transaction = await this.model.sequelize.transaction();
        try {
            const city = await this.model.findByPk(numericId, { transaction });
            if (!city) {
                await transaction.rollback();
                return null;
            }

            const { DestinationMapping, Hotel } = this.model.sequelize.models;
            const mappingsRemoved = DestinationMapping
                ? await DestinationMapping.destroy({ where: { city_id: numericId }, transaction })
                : 0;
            const hotelsUnlinked = Hotel
                ? (await Hotel.update({ city_id: null }, { where: { city_id: numericId }, transaction }))[0]
                : 0;

            await city.destroy({ transaction });
            await transaction.commit();
            return { id: numericId, mappingsRemoved, hotelsUnlinked };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteMany(ids = []) {
        const cityIds = [...new Set(ids.map(Number).filter(id => Number.isInteger(id) && id > 0))];
        if (!cityIds.length) return { deleted: 0, mappingsRemoved: 0, hotelsUnlinked: 0 };

        const transaction = await this.model.sequelize.transaction();
        try {
            const Op = this.model.sequelize.Sequelize.Op;
            const { DestinationMapping, Hotel } = this.model.sequelize.models;
            const where = { city_id: { [Op.in]: cityIds } };
            const mappingsRemoved = DestinationMapping
                ? await DestinationMapping.destroy({ where, transaction })
                : 0;
            const hotelsUnlinked = Hotel
                ? (await Hotel.update({ city_id: null }, { where, transaction }))[0]
                : 0;
            const deleted = await this.model.destroy({
                where: { id: { [Op.in]: cityIds } },
                transaction
            });

            await transaction.commit();
            return { deleted, mappingsRemoved, hotelsUnlinked };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = CityRepository;
