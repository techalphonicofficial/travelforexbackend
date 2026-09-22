const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const tfc = (method) => (req, res) =>
    controllers.tripJackFlightController[method](req, res);

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

/**
 * @swagger
 * /api/v1/tripjack/flights/fare-validate:
 *   post:
 *     summary: Validate flight fare before booking
 *     tags:
 *       - TripJack Flights
 */
router.post('/fare-validate', tfc('fareValidate'));

/**
 * @swagger
 * /api/v1/tripjack/flights/book:
 *   post:
 *     summary: Book selected TripJack flight
 *     tags:
 *       - TripJack Flights
 */
router.post('/book', tfc('book'));

/**
 * @swagger
 * /api/v1/tripjack/flights/confirm-book:
 *   post:
 *     summary: Confirm held TripJack flight booking
 *     tags:
 *       - TripJack Flights
 */
router.post('/confirm-book', tfc('confirmBook'));

/**
 * @swagger
 * /api/v1/tripjack/flights/booking-details:
 *   post:
 *     summary: Get TripJack flight booking details
 *     tags:
 *       - TripJack Flights
 */
router.post('/booking-details', tfc('bookingDetails'));

module.exports = router;