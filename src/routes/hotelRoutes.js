const express = require('express');
const router = express.Router();
const { repositories: { hotelRepo } } = require('../container');

/**
 * @swagger
 * /api/v1/hotels:
 *   get:
 *     summary: Get paginated hotels with search and location filters
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by hotel name, provider, city, or country
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country name
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name
 *       - in: query
 *         name: city_id
 *         schema:
 *           type: integer
 *         description: Filter by city ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated hotels
 */
router.get('/', async (req, res) => {
    try {
        const result = await hotelRepo.findPaginated({
            search: req.query.search,
            country: req.query.country,
            city: req.query.city,
            city_id: req.query.city_id,
            cityId: req.query.cityId,
            page: req.query.page,
            limit: req.query.limit
        });

        res.json({
            success: true,
            data: {
                count: result.count,
                rows: result.rows,
                pagination: result.pagination
            }
        });
    } catch (err) {
        console.error('Error fetching hotels:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await hotelRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
