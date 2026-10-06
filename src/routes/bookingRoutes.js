
const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const bc = (method) => (req, res) =>
    controllers.bookingController[method](req, res);

/**
 * Create booking
 */
router.post('/', bc('createBooking'));

router.post('/continue-to-pay/:bookingId', bc('continueToPay'));

router.post('/hotel', bc('createHotelBooking'));

/** 
 * Admin: All bookings (paginated)
 */
router.get(
    '/allBookingsByAdmin',
    bc('getBookingsByUserId')
);

/**
 * Booking details by reference
 */
router.get(
    '/booking-details/:id',
    bc('getBookingByReference')
);

/**
 * User bookings
 */
router.get(
    '/user/:userId',
    bc('getBookingsByUserId')
);

/**
 * Booking details by ID
 */
router.get('/:id', bc('getBooking'));

module.exports = router;