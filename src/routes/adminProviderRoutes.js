const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const ap = (method) => (req, res) =>
    controllers.adminProviderController[method](req, res);

// List all providers
router.get('/', ap('index'));

// TripJack Bookings
router.get('/tripjack-bookings', ap('tripjackBookings'));
router.get('/tripjack-bookings/data', ap('tripjackBookingsData'));
router.get('/tripjack-bookings/:id/details', ap('tripjackBookingDetails'));
router.post('/tripjack-bookings/:id/refresh', ap('tripjackBookingRefresh'));
router.post('/tripjack-bookings/:id/refund', ap('tripjackBookingRefund'));

// Create provider
router.post('/', ap('create'));

// Update provider
router.post('/:id/update', ap('update'));

// Delete provider
router.post('/:id/delete', ap('delete'));

module.exports = router;