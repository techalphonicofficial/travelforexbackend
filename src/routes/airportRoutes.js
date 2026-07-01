const express = require('express');
const router = express.Router();
const { controllers: { apiAirportController }, repositories: { appSettingRepo } } = require('../container');

// ── API Key Auth: reads key from database (CRM > API Integration) ──────────
async function apiKeyAuth(req, res, next) {
    try {
        const savedKey = await appSettingRepo.get('crm_api_key');
        if (!savedKey) return next(); // No key configured — allow open access

        const provided = req.headers['x-api-key'] || req.query['x-api-key'];
        if (!provided || provided !== savedKey) {
            return res.status(403).json({ success: false, message: 'Invalid x-api-key' });
        }
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}


/**
 * @swagger
 * /api/v1/airports/search:
 *   get:
 *     summary: Search for public airports globally (excludes heliports and closed airports)
 *     tags: [Airports]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: API Key for authentication
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
 *         description: Number of items to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, ident, iata_code, city, or country
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country (e.g. IN, LK, US)
 *       - in: query
 *         name: continent
 *         schema:
 *           type: string
 *         description: Filter by continent (e.g. AS, EU, NA)
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for finding nearby airports
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for finding nearby airports
 *     responses:
 *       200:
 *         description: A list of airports
 *       401:
 *         description: x-api-key is missing
 *       403:
 *         description: Invalid x-api-key
 */
// Public Search Endpoint (Requires x-api-key)
router.get('/search', apiKeyAuth, (req, res) => apiAirportController.searchPublic(req, res));

// Search and list paginated airports
router.get('/paginated', (req, res) => apiAirportController.getPaginated(req, res));

// Bulk Delete
router.post('/bulk-delete', (req, res) => apiAirportController.bulkDelete(req, res));

// Delete Single
router.delete('/:id', (req, res) => apiAirportController.delete(req, res));

module.exports = router;
