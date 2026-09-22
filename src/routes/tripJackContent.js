const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const tcc = (method) => (req, res) =>
    controllers.tripJackContentController[method](req, res);

/**
 * @swagger
 * /api/v1/tripjack/content/city-search:
 *   get:
 *     summary: Search cached TripJack city/region list by name
 *     tags:
 *       - TripJack Content
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: goa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Matching cities from the local cache
 *       400:
 *         description: Invalid request
 */
router.get('/city-search', tcc('cityRegionSearch'));

/**
 * @swagger
 * /api/v1/tripjack/content/hids-by-region:
 *   post:
 *     summary: Get TripJack hotel IDs (hids) for given region IDs
 *     tags:
 *       - TripJack Content
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               regionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["113470"]
 *               countryName:
 *                 type: string
 *                 example: INDIA
 *               page:
 *                 type: integer
 *                 example: 0
 *               size:
 *                 type: integer
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Hotel ID mapping
 *       400:
 *         description: Invalid request
 *       500:
 *         description: TripJack API error
 */
router.post('/hids-by-region', tcc('hotelIdsByRegion'));

/**
 * @swagger
 * /api/v1/tripjack/content/sync-city-regions:
 *   post:
 *     summary: Sync the full TripJack city/region catalogue into the local DB (run once, then periodically)
 *     tags:
 *       - TripJack Content
 *     responses:
 *       200:
 *         description: Sync summary — pages and records synced
 *       500:
 *         description: TripJack API error
 */
router.post('/sync-city-regions', tcc('syncCityRegions'));

module.exports = router;