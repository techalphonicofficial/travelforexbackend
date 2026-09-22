const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();



router.post(
    '/',
    bookingController.createBooking
);

router.get(
    '/:id',
    bookingController.getBooking
);

module.exports = router;