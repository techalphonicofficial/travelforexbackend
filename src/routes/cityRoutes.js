const express = require('express');
const router = express.Router();
const { repositories: { cityRepo } } = require('../container');

router.get('/', async (req, res) => {
    try {
        const data = await cityRepo.findAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/cities/paginated:
 *   get:
 *     summary: Get paginated cities with search and filters
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for city name
 *       - in: query
 *         name: countryName
 *         schema:
 *           type: string
 *         description: Filter by Country Name
 *       - in: query
 *         name: continentName
 *         schema:
 *           type: string
 *         description: Filter by Continent Name
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */
router.get('/paginated', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const continentName = req.query.continentName || '';
        const countryName = req.query.countryName || '';
        
        const data = await cityRepo.findPaginated(page, limit, search, continentName, countryName);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/by-country/:countryId', async (req, res) => {
    try {
        const data = await cityRepo.findByCountryId(req.params.countryId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await cityRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const data = await cityRepo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const data = await cityRepo.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await cityRepo.delete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'City not found' });
        res.json({ success: true, message: 'Deleted successfully', data: result });
    } catch (err) {
        console.error('City API delete failed:', err);
        res.status(500).json({ success: false, message: 'Unable to delete city.' });
    }
});

module.exports = router;
