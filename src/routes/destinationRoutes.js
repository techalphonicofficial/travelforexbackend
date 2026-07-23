const express = require('express');
const router = express.Router();
const { repositories: { destinationRepo } } = require('../container');

/**
 * @openapi
 * /api/v1/destinations:
 *   get:
 *     summary: Get all destinations
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter destinations by category
 *     responses:
 *       200:
 *         description: List of destinations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 */
router.get('/', async (req, res) => {
    try {
        let data;
        if (req.query.category_id) {
            data = await destinationRepo.findByCategory(req.query.category_id);
        } else {
            data = await destinationRepo.findAll();
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/trending:
 *   get:
 *     summary: Get trending destinations
 *     tags: [Destinations]
 *     responses:
 *       200:
 *         description: List of trending destinations
 */
router.get('/trending', async (req, res) => {
    try {
        const data = await destinationRepo.findTrending();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/visa-free:
 *   get:
 *     summary: Get visa-free destinations
 *     tags: [Destinations]
 *     responses:
 *       200:
 *         description: List of visa-free destinations
 */
router.get('/visa-free', async (req, res) => {
    try {
        const data = await destinationRepo.findVisaFree();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/visa-tabs:
 *   get:
 *     summary: Get destinations grouped into visa tabs
 *     tags: [Destinations]
 *     responses:
 *       200:
 *         description: Ordered array of visa tab objects and their destinations
 */
router.get('/visa-tabs', async (req, res) => {
    try {
        const data = await destinationRepo.findVisaTabs();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/customizable', async (req, res) => {
    try {
        const data = await destinationRepo.findCustomizable();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/slug/{slug}:
 *   get:
 *     summary: Get destination by slug with full details and gallery
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The destination slug
 *     responses:
 *       200:
 *         description: Destination details, gallery, and geographical mappings
 *       404:
 *         description: Destination not found
 */
router.get('/slug/:slug', async (req, res) => {
    try {
        const data = await destinationRepo.findBySlug(req.params.slug);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/slug/{slug}/related-by-country:
 *   get:
 *     summary: Get all destinations located in the same country as the provided destination slug
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the source destination
 *     responses:
 *       200:
 *         description: List of destinations in the same country
 *       404:
 *         description: Destination not found
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug/related-by-country', async (req, res) => {
    try {
        const { models: { Destination, DestinationMapping, City, Country } } = require('../container');
        
        // Find the destination by slug
        const targetDest = await Destination.findOne({ where: { slug: req.params.slug } });
        if (!targetDest) {
             return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        // Find mappings for the current destination
        const currentMappings = await DestinationMapping.findAll({
            where: { destination_id: targetDest.id },
            attributes: ['city_id'],
            raw: true
        });
        
        if (!currentMappings || currentMappings.length === 0) {
             return res.json({ success: true, data: [] });
        }
        
        const currentCityIds = currentMappings.map(m => m.city_id).filter(Boolean);
        
        // Get unique country_ids from those cities
        const currentCities = await City.findAll({
            where: { id: currentCityIds },
            attributes: ['country_id'],
            raw: true
        });
        const countryIds = [...new Set(currentCities.map(c => c.country_id).filter(Boolean))];
        
        if (countryIds.length === 0) {
             return res.json({ success: true, data: [] });
        }
        
        // Find all cities belonging to those countries
        const allCitiesInCountries = await City.findAll({
            where: { country_id: countryIds },
            attributes: ['id', 'country_id'],
            raw: true
        });
        const cityIds = allCitiesInCountries.map(c => c.id);
        
        if (cityIds.length === 0) {
             return res.json({ success: true, data: [] });
        }
        
        // Fetch Country names
        const countries = await Country.findAll({
            where: { id: countryIds },
            attributes: ['id', 'name'],
            raw: true
        });
        const countryMap = {};
        countries.forEach(c => countryMap[c.id] = c.name);

        const cityToCountryMap = {};
        allCitiesInCountries.forEach(c => {
            cityToCountryMap[c.id] = countryMap[c.country_id];
        });
        
        // Find all destination mappings for those cities (raw to save memory)
        const relatedMappings = await DestinationMapping.findAll({
            where: { city_id: cityIds },
            attributes: ['destination_id', 'city_id'],
            raw: true
        });
        
        const destIds = [...new Set(relatedMappings.map(m => m.destination_id))];
        if (destIds.length === 0) {
             return res.json({ success: true, data: [] });
        }

        // Map each destination_id to its country name
        const destCountryMap = {};
        for (const m of relatedMappings) {
            if (!destCountryMap[m.destination_id] && cityToCountryMap[m.city_id]) {
                destCountryMap[m.destination_id] = cityToCountryMap[m.city_id];
            }
        }

        // Fetch actual destinations
        const destinations = await Destination.findAll({
            where: { id: destIds }
        });
        
        const relatedDestinations = destinations.map(dest => {
            const destData = dest.toJSON ? dest.toJSON() : { ...dest.dataValues };
            if (destCountryMap[dest.id]) {
                destData.country = destCountryMap[dest.id];
            }
            return destData;
        });
        
        res.json({ success: true, data: relatedDestinations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/slug/{slug}/related-packages:
 *   get:
 *     summary: Get active packages related to a destination
 *     tags: [Destinations, Packages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated active packages mapped to the destination
 *       404:
 *         description: Destination not found
 */
router.get('/slug/:slug/related-packages', async (req, res) => {
    try {
        const result = await destinationRepo.findRelatedPackagesBySlug(req.params.slug, {
            page: req.query.page,
            limit: req.query.limit
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }

        res.json({
            success: true,
            destination: result.destination,
            data: result.packages,
            total: result.total,
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            limit: result.limit
        });
    } catch (err) {
        console.error('Related destination packages failed:', err);
        res.status(500).json({ success: false, message: 'Unable to load related packages.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await destinationRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



router.post('/', async (req, res) => {
    try {
        const data = await destinationRepo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids)
            ? [...new Set(req.body.ids.map(Number).filter(Number.isInteger))]
            : [];
        if (!ids.length) {
            return res.status(400).json({ success: false, message: 'Select at least one destination.' });
        }

        const deletedCount = await destinationRepo.deleteMany(ids);
        res.json({ success: true, message: 'Deleted successfully', deletedCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const data = await destinationRepo.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await destinationRepo.delete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Destination not found' });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
