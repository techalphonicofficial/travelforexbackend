const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const tfc = (method) => (req, res, next) =>
    controllers.tripJackFlightController[method](req, res, next);

/**
 * @swagger
 * /api/v1/tripjack/flights/search:
 *   post:
 *     summary: Search flights using TripJack Flight Search API
 *     tags:
 *       - TripJack Flights
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: TripJack flight search response
 *       400:
 *         description: Invalid request
 *       500:
 *         description: TripJack API error
 */
router.post('/search', tfc('search'));

/**
 * @swagger
 * /api/v1/tripjack/flights/fare-rule:
 *   post:
 *     summary: Get fare rules for selected TripJack flight
 *     tags:
 *       - TripJack Flights
 */
router.post('/fare-rule', tfc('fareRule'));

/**
 * @swagger
 * /api/v1/tripjack/flights/review:
 *   post:
 *     summary: Review selected TripJack flight
 *     tags:
 *       - TripJack Flights
 */
router.post('/review', tfc('review'));

/**
 * @swagger
 * /api/v1/tripjack/flights/seat:
 *   post:
 *     summary: Get seat map for selected TripJack flight
 *     tags:
 *       - TripJack Flights
 */
router.post('/seat', tfc('seat'));

/*
 * fare-validate, book, confirm-book and booking-details are NOT public:
 * booking happens only on the server after a verified payment
 * (BookingService / IciciPaymentService). Exposing "book" would let anyone
 * issue tickets from the supplier wallet without paying.
 */

module.exports = router;