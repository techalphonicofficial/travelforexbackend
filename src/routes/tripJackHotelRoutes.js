const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const thc = (method) => (req, res) =>
    controllers.tripJackHotelController[method](req, res);

/**
 * @swagger
 * /api/v1/tripjack/hotels/listing:
 *   post:
 *     summary: Search hotels using TripJack Hotel Listing API
 *     tags:
 *       - TripJack Hotels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkIn
 *               - checkOut
 *               - rooms
 *               - currency
 *               - correlationId
 *               - nationality
 *             properties:
 *               checkIn:
 *                 type: string
 *                 example: "2026-09-25"
 *               checkOut:
 *                 type: string
 *                 example: "2026-09-26"
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     adults:
 *                       type: integer
 *                       example: 2
 *                     children:
 *                       type: integer
 *                       example: 0
 *                     childAge:
 *                       type: array
 *                       items:
 *                         type: integer
 *               currency:
 *                 type: string
 *                 example: INR
 *               correlationId:
 *                 type: string
 *                 example: travel-forex-test-001
 *               nationality:
 *                 type: string
 *                 example: "106"
 *               timeoutMs:
 *                 type: integer
 *                 example: 13000
 *               hids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: TripJack hotel listing response
 *       400:
 *         description: Invalid request
 *       500:
 *         description: TripJack API error
 */
router.post('/listing', thc('listing'));

/**
 * @swagger
 * /api/v1/tripjack/hotels/pricing:
 *   post:
 *     summary: Get dynamic hotel pricing and room options from TripJack
 *     tags:
 *       - TripJack Hotels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correlationId
 *               - hid
 *               - checkIn
 *               - checkOut
 *               - rooms
 *               - currency
 *               - nationality
 *             properties:
 *               correlationId:
 *                 type: string
 *                 example: "1p6IYhwDQ9NGwiZ8FaigQz"
 *               hid:
 *                 type: string
 *                 example: "100000224831"
 *               checkIn:
 *                 type: string
 *                 example: "2026-09-19"
 *               checkOut:
 *                 type: string
 *                 example: "2026-09-25"
 *               rooms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     adults:
 *                       type: integer
 *                       example: 2
 *                     children:
 *                       type: integer
 *                       example: 2
 *                     childAge:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [3, 5]
 *               currency:
 *                 type: string
 *                 example: "INR"
 *               nationality:
 *                 type: string
 *                 example: "106"
 *               timeoutMs:
 *                 type: integer
 *                 example: 13000
 *     responses:
 *       200:
 *         description: Dynamic hotel pricing response
 *       400:
 *         description: Invalid request
 *       500:
 *         description: TripJack API error
 */
router.post('/pricing', thc('pricing'));


/**
 * @swagger
 * /api/v1/tripjack/hotels/review:
 *   post:
 *     summary: Review selected TripJack hotel option
 *     tags:
 *       - TripJack Hotels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correlationId
 *               - optionId
 *               - reviewHash
 *               - hid
 *             properties:
 *               correlationId:
 *                 type: string
 *                 example: "1p6IYhwDQ9NGwiZ8FaigQz"
 *               optionId:
 *                 type: string
 *                 example: "d3a4a730-3943-494d-9d8e-f479ad91db54"
 *               reviewHash:
 *                 type: string
 *                 example: "1XEKPumWXYMQTMd7XQFzac|1p6IYhwDQ9NGwiZ8FaigQz"
 *               hid:
 *                 type: string
 *                 example: "100000224831"
 *     responses:
 *       200:
 *         description: Hotel review response
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/review', thc('review'));


/**
 * @swagger
 * /api/v1/tripjack/hotels/nationalities:
 *   get:
 *     summary: Get hotel nationality list from TripJack
 *     tags:
 *       - TripJack Hotels
 *     responses:
 *       200:
 *         description: TripJack nationality list
 *       500:
 *         description: TripJack API error
 */
router.get('/nationalities', thc('getNationalities'));

module.exports = router;