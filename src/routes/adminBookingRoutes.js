const express = require('express');
const router = express.Router();
const { controllers: { adminBookingController, adminTripBuilderController, apiPackageBookingController } } = require('../container');

const attachSessionUser = (req, res, next) => {
    req.user = req.session.user || req.user || null;
    next();
};

const redirectAfterJson = (handler) => async (req, res, next) => {
    const originalStatus = res.status.bind(res);
    const originalJson = res.json.bind(res);
    let statusCode = 200;

    res.status = (code) => {
        statusCode = code;
        return res;
    };
    res.json = (payload = {}) => {
        res.status = originalStatus;
        res.json = originalJson;
        const key = payload.success ? 'success' : 'error';
        const message = encodeURIComponent(payload.message || (payload.success ? 'Request updated' : 'Unable to update request'));
        return originalStatus(303).redirect(`/admin/bookings/return-requests?${key}=${message}`);
    };

    try {
        await handler(req, res, next);
    } catch (error) {
        res.status = originalStatus;
        res.json = originalJson;
        const message = encodeURIComponent(error.message || 'Unable to update request');
        return originalStatus(303).redirect(`/admin/bookings/return-requests?error=${message}`);
    }
};

// Trip Builder APIs
router.post('/api/init', (req, res) => adminTripBuilderController.initTrip(req, res));
router.get('/api/packages/:packageId/quote', (req, res) => adminTripBuilderController.getPackageQuote(req, res));
router.post('/api/package-bookings/validate-coupon', (req, res) => adminTripBuilderController.validatePackageCoupon(req, res));
router.post('/api/package-bookings', (req, res) => adminTripBuilderController.createPackageBooking(req, res));
router.get('/api/destinations/:destinationId/hotels', (req, res) => adminTripBuilderController.getHotels(req, res));
router.get('/api/destinations/:destinationId/activities', (req, res) => adminTripBuilderController.getActivities(req, res));
router.put('/api/build/:tripId/days/:dayNumber/hotel', (req, res) => adminTripBuilderController.setHotel(req, res));
router.put('/api/build/:tripId/days/id/:dayId/description', (req, res) => adminTripBuilderController.updateDayDescription(req, res));
router.put('/api/build/:tripId/days/id/:dayId/destination', (req, res) => adminTripBuilderController.updateDayDestination(req, res));
router.post('/api/build/:tripId/days/:dayNumber/activities', (req, res) => adminTripBuilderController.addActivity(req, res));
router.delete('/api/build/:tripId/days/:dayNumber/activities/:activityId', (req, res) => adminTripBuilderController.removeActivity(req, res));
router.post('/api/checkout', (req, res) => adminTripBuilderController.checkout(req, res));

// Standard Booking Routes
router.get('/', (req, res) => adminBookingController.index(req, res));
router.get('/create', (req, res) => adminBookingController.create(req, res));
router.get('/package-bookings', (req, res) => adminBookingController.packageBookings(req, res));
router.post('/package-bookings/:booking_id/pay-remaining', attachSessionUser, (req, res) => apiPackageBookingController.payRemaining(req, res));
router.post('/package-bookings/:booking_id/refund', attachSessionUser, (req, res) => apiPackageBookingController.refundBooking(req, res));
router.get('/package-bookings/:booking_id/download', attachSessionUser, (req, res) => adminBookingController.downloadPackageBooking(req, res));
router.get('/package-bookings/:booking_id/edit', attachSessionUser, (req, res) => adminBookingController.editPackageBooking(req, res));
router.get('/package-bookings/:booking_id', attachSessionUser, (req, res) => adminBookingController.viewPackageBooking(req, res));
router.post('/package-bookings/:booking_id', attachSessionUser, (req, res) => adminBookingController.updatePackageBooking(req, res));
router.get('/return-requests', (req, res) => adminBookingController.returnRequests(req, res));
router.post('/return-requests/:request_id/approve', attachSessionUser, redirectAfterJson((req, res) => apiPackageBookingController.approveReturnRequest(req, res)));
router.post('/return-requests/:request_id/reject', attachSessionUser, redirectAfterJson((req, res) => apiPackageBookingController.rejectReturnRequest(req, res)));
router.get('/hotel-bookings', (req, res) => adminBookingController.hotelBookings(req, res));
router.post('/hotel-bookings/:id/status', (req, res) => adminBookingController.updateHotelBookingStatus(req, res));
router.get('/inquiries', (req, res) => adminBookingController.inquiries(req, res));
router.get('/inquiries/:id', (req, res) => adminBookingController.showInquiry(req, res));
router.get('/inquiries/:id/edit', (req, res) => adminBookingController.editInquiry(req, res));
router.get('/inquiries/:id/build', (req, res) => adminBookingController.buildBookingFromInquiry(req, res));
router.post('/inquiries/:id/status', (req, res) => adminBookingController.updateInquiryStatus(req, res));
router.post('/inquiries/:id/price', (req, res) => adminBookingController.updateInquiryPrice(req, res));
router.patch('/inquiries/:id/cities', (req, res) => adminBookingController.updateInquiryCities(req, res));
router.post('/inquiries/:id/reviews', (req, res) => adminBookingController.createInquiryReview(req, res));
router.put('/inquiries/:id/reviews/:reviewId', (req, res) => adminBookingController.updateInquiryReview(req, res));
router.delete('/inquiries/:id/reviews/:reviewId', (req, res) => adminBookingController.deleteInquiryReview(req, res));
router.post('/inquiries/:id', (req, res) => adminBookingController.updateInquiry(req, res));
router.get('/:id', (req, res) => adminBookingController.show(req, res));
router.get('/:id/edit', (req, res) => adminBookingController.edit(req, res));
router.post('/:id', (req, res) => adminBookingController.update(req, res));
module.exports = router;
