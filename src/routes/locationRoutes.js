const express = require('express');
const router = express.Router();
const { models: { Country, City } } = require('../container');

function normalizeLimit(value) {
    const parsed = parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return 20;
    return Math.min(parsed, 100);
}

function toCountrySuggestion(country) {
    const row = country.get ? country.get({ plain: true }) : country;
    return {
        type: 'country',
        id: row.id,
        name: row.name,
        label: row.name,
        latitude: row.latitude,
        longitude: row.longitude
    };
}

function toCitySuggestion(city) {
    const row = city.get ? city.get({ plain: true }) : city;
    const countryName = row.country ? row.country.name : null;
    return {
        type: 'city',
        id: row.id,
        name: row.name,
        label: countryName ? `${row.name}, ${countryName}` : row.name,
        country_id: row.country_id,
        country_name: countryName,
        latitude: row.latitude,
        longitude: row.longitude
    };
}

/**
 * @swagger
 * /api/v1/locations/country-city:
 *   get:
 *     summary: Search countries and cities
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for country or city name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Max records per group. Maximum 100.
 *     responses:
 *       200:
 *         description: Countries and cities for search suggestions
 */
router.get('/country-city', async (req, res) => {
    try {
        const Op = Country.sequelize.Sequelize.Op;
        const search = String(req.query.search || req.query.q || '').trim();
        const limit = normalizeLimit(req.query.limit);
        const countryWhere = {};
        const cityWhere = {};

        if (search) {
            countryWhere.name = { [Op.iLike]: `%${search}%` };
            cityWhere.name = { [Op.iLike]: `%${search}%` };
        }

        const [countryRows, cityRows] = await Promise.all([
            Country.findAll({
                where: countryWhere,
                attributes: ['id', 'name', 'latitude', 'longitude'],
                order: [['name', 'ASC']],
                limit
            }),
            City.findAll({
                where: cityWhere,
                attributes: ['id', 'name', 'country_id', 'latitude', 'longitude'],
                include: [{ model: Country, as: 'country', attributes: ['id', 'name'], required: false }],
                order: [['name', 'ASC']],
                limit
            })
        ]);

        const countries = countryRows.map(toCountrySuggestion);
        const cities = cityRows.map(toCitySuggestion);

        res.json({
            success: true,
            data: {
                countries,
                cities,
                suggestions: [...countries, ...cities]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
