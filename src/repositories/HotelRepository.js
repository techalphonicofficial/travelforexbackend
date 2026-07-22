class HotelRepository {
    constructor(Hotel) {
        this.Hotel = Hotel;
    }

    normalizeText(value) {
        return String(value || '').trim();
    }

    normalizePaging(page = 1, limit = 20) {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        return {
            page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
            limit: Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20
        };
    }

    async findPaginated(filters = {}) {
        const Op = this.Hotel.sequelize.Sequelize.Op;
        const { City, Country, Media } = this.Hotel.sequelize.models;
        const { page, limit } = this.normalizePaging(filters.page, filters.limit);
        const search = this.normalizeText(filters.search);
        const city = this.normalizeText(filters.city);
        const country = this.normalizeText(filters.country);
        const cityId = parseInt(filters.city_id || filters.cityId, 10);

        const where = {};
        const andConditions = [];

        if (Number.isInteger(cityId) && cityId > 0) {
            andConditions.push({ city_id: cityId });
        }

        if (city) {
            andConditions.push({ '$city.name$': { [Op.iLike]: `%${city}%` } });
        }

        if (country) {
            andConditions.push({ '$city.country.name$': { [Op.iLike]: `%${country}%` } });
        }

        if (search) {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { provider_name: { [Op.iLike]: `%${search}%` } },
                    { '$city.name$': { [Op.iLike]: `%${search}%` } },
                    { '$city.country.name$': { [Op.iLike]: `%${search}%` } }
                ]
            });
        }

        if (andConditions.length) {
            where[Op.and] = andConditions;
        }

        const include = [];
        if (City) {
            include.push({
                model: City,
                as: 'city',
                attributes: ['id', 'name', 'country_id', 'latitude', 'longitude'],
                required: Boolean(city || country || search || (Number.isInteger(cityId) && cityId > 0)),
                include: Country ? [{
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'name', 'continent_id'],
                    required: Boolean(country)
                }] : []
            });
        }

        if (Media) {
            include.push({
                model: Media,
                as: 'gallery',
                attributes: ['id', 'url', 'media_type', 'alt_text', 'is_primary'],
                required: false,
                separate: true,
                order: [['is_primary', 'DESC'], ['id', 'ASC']]
            });
        }

        const result = await this.Hotel.findAndCountAll({
            attributes: { exclude: ['destination_id'] },
            where,
            include,
            distinct: true,
            subQuery: false,
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            count: result.count,
            rows: result.rows,
            pagination: {
                page,
                limit,
                total: result.count,
                totalPages: Math.max(1, Math.ceil(result.count / limit))
            }
        };
    }

    async findAll() {
        return await this.Hotel.findAll();
    }

    async findByDestination(destinationId) {
        return await this.Hotel.findAll({ where: { destination_id: destinationId } });
    }

    async findById(id) {
        const { City, Country, Media } = this.Hotel.sequelize.models;
        const include = [];
        if (City) {
            include.push({
                model: City,
                as: 'city',
                attributes: ['id', 'name', 'country_id', 'latitude', 'longitude'],
                required: false,
                include: Country ? [{
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'name', 'continent_id'],
                    required: false
                }] : []
            });
        }
        if (Media) {
            include.push({
                model: Media,
                as: 'gallery',
                attributes: ['id', 'url', 'media_type', 'alt_text', 'is_primary'],
                required: false,
                separate: true,
                order: [['is_primary', 'DESC'], ['id', 'ASC']]
            });
        }
        return await this.Hotel.findByPk(id, {
            attributes: { exclude: ['destination_id'] },
            include
        });
    }

    async create(data) {
        return await this.Hotel.create(data);
    }

    async update(id, data) {
        const hotel = await this.findById(id);
        if (hotel) {
            return await hotel.update(data);
        }
        return null;
    }

    async delete(id) {
        const hotel = await this.findById(id);
        if (hotel) {
            await hotel.destroy();
            return true;
        }
        return false;
    }
}

module.exports = HotelRepository;
