
const express = require('express');

const router = express.Router();

const { controllers } = require('../container');
const { apiAuth } = require('../middleware/apiAuthMiddleware');

const bc = (method) => (req, res, next) =>
    controllers.bookingController[method](req, res, next);

/**
 * Create booking
 */
// Flight booking + payment need a logged-in user
router.post('/', apiAuth, bc('createBooking'));

router.post('/continue-to-pay/:bookingId', apiAuth, bc('continueToPay'));

// Hotel booking + payment need a logged-in user
router.post('/hotel', apiAuth, bc('createHotelBooking'));

/*
 * Admin booking list moved to the session-protected admin panel:
 * GET /admin/providers/tripjack-bookings/data
 */

/**
 * Booking details by reference (owner only)
 */
router.get(
    '/booking-details/:id',
    apiAuth,
    bc('getBookingByReference')
);

/**
 * Logged-in user's bookings (own bookings only)
 */
router.get(
    '/user/:userId',
    apiAuth,
    bc('getBookingsByUserId')
);

/**
 * Booking details by ID (owner only)
 */
router.get('/:id', apiAuth, bc('getBooking'));

module.exports = router;
