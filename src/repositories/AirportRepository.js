const BaseRepository = require('./BaseRepository');

class AirportRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async findPaginated(page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        const Op = this.model.sequelize.Sequelize.Op;
        
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { ident: { [Op.iLike]: `%${search}%` } },
                { iata_code: { [Op.iLike]: `%${search}%` } },
                { municipality: { [Op.iLike]: `%${search}%` } }
            ];
        }

        return this.model.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
        });
    }

    async bulkDelete(ids) {
        return this.model.destroy({
            where: {
                id: ids
            }
        });
    }

    async searchPublicAirports(lat, lng, search, limit = 20, page = 1, country = null, continent = null) {
        const Op = this.model.sequelize.Sequelize.Op;
        const offset = (page - 1) * limit;
        
        const whereClause = {
            type: {
                [Op.notIn]: ['heliport', 'closed']
            }
        };

        if (country) {
            whereClause.iso_country = { [Op.iLike]: country };
        }

        if (continent) {
            whereClause.continent = { [Op.iLike]: continent };
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { ident: { [Op.iLike]: `%${search}%` } },
                { iata_code: { [Op.iLike]: `%${search}%` } },
                { municipality: { [Op.iLike]: `%${search}%` } },
                { iso_country: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const queryOptions = {
            where: whereClause,
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0
        };

        // If lat and lng are provided, order by closest (euclidean distance for simplicity)
        if (lat && lng) {
            const sequelize = this.model.sequelize;
            queryOptions.order = [
                sequelize.literal(`((latitude_deg - ${parseFloat(lat)}) * (latitude_deg - ${parseFloat(lat)}) + (longitude_deg - ${parseFloat(lng)}) * (longitude_deg - ${parseFloat(lng)})) ASC`)
            ];
        } else {
            // fallback order if no coordinates provided
            queryOptions.order = [['name', 'ASC']];
        }

        return this.model.findAndCountAll(queryOptions);
    }
}

module.exports = AirportRepository;
