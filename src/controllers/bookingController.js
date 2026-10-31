const { customerMessage, toCustomerBooking } = require('../utils/customerSafe');

/* The logged-in customer may only see their own bookings */
const isOwner = (booking, req) =>
    Boolean(req.user?.id) && String(booking?.user_id) === String(req.user.id);

class BookingController {

    constructor(bookingService) {
        this.bookingService = bookingService;
    }


    /**
     * Create Booking
     */
    async createBooking(req, res) {

        try {

            const {
                userId,
                bookingType,
                provider,
                providerBookingId,
                providerReference,
                amount,
                currency,
                correlationId,
                bookingData,
                paymentData
            } = req.body;

            const booking =
                await this.bookingService.createBooking({

                    // Logged-in user from the JWT, never from the request body
                    userId:
                        req.user?.id ?? userId,

                    bookingType,

                    provider,

                    providerBookingId,

                    providerReference,

                    amount,

                    currency:
                        currency || 'INR',

                    correlationId,

                    bookingData,

                    paymentData
                });


            return res.status(201).json({

                success: true,

                message:
                    'Booking created successfully',

                // never return the supplier validation payload to the browser
                data: {
                    success: booking?.success,
                    // no supplier name for customers
                    booking: booking?.booking
                        ? (({ provider, ...rest }) => rest)(booking.booking)
                        : null,
                    amountBreakup: booking?.amountBreakup
                }
            });


        } catch (error) {

            console.error(
                'Create Booking Error:',
                error
            );


            return res.status(
                error.status || 500
            ).json({

                success: false,

                message:
                    customerMessage(
                        error.message,
                        'We could not confirm this fare. Please try again or choose another flight.'
                    )
            });
        }
    }


    async createHotelBooking(req, res) {
        try {
            const { bookingType, provider, amount, currency, correlationId, bookingData } = req.body || {};

            const result = await this.bookingService.createHotelBooking({
                // logged-in user from the JWT, never from the body
                userId: req.user?.id || null,
                bookingType: bookingType || 'HOTEL',
                provider: provider || 'TRIPJACK',
                amount,
                currency: currency || 'INR',
                correlationId: correlationId || bookingData?.tripjack?.correlationId || null,
                bookingData
            });

            return res.status(201).json({
                success: true,
                message: 'Hotel booking created successfully',
                data: result
            });
        } catch (error) {
            console.error('Create Hotel Booking Error:', error.message);
            return res.status(error.status || 500).json({
                success: false,
                message: customerMessage(error.message, 'Unable to start the booking. Please try again.')
            });
        }
    }

    async continueToPay(req, res) {
        console.log('continueToPay called');
        try {
            const { bookingId } = req.params;

            const result = await this.bookingService.continueToPay({
                bookingId,
                userId: req.user?.id ?? null,
                environment: 'UAT'
            });

            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: result
            });
        } catch (error) {
            console.error('Continue to Pay Error:', error);
            return res.status(error.status || 500).json({
                success: false,
                message: customerMessage(error.message, 'Unable to start the payment. Please try again.')
            });
        }
    }   

    /**
     * Get Booking By ID
     */
    async getBooking(req, res) {
        try {
            const booking = await this.bookingService.findById(req.params.id);

            if (!booking || !isOwner(booking, req)) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            return res.status(200).json({ success: true, data: toCustomerBooking(booking) });
        } catch (error) {
            console.error('Get Booking Error:', error);
            return res.status(500).json({ success: false, message: 'Unable to fetch booking' });
        }
    }

    /**
     * Get Booking by booking reference (customer, owner only)
     */
    async getBookingByReference(req, res) {
        try {
            let booking = await this.bookingService.findByBookingReference(req.params.id);

            if (!booking || !isOwner(booking, req)) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            // Paid flight still in progress / payment not reported yet:
            // refresh from the airline / payment gateway (throttled)
            booking = await this.bookingService.refreshFlightStatus(booking);
            booking = await this.bookingService.refreshPaymentStatus(booking);

            return res.status(200).json({ success: true, data: toCustomerBooking(booking) });
        } catch (error) {
            console.error('Get Booking Error:', error);
            return res.status(500).json({ success: false, message: 'Unable to fetch booking' });
        }
    }

    /**
     * Logged-in customer's bookings
     */
    async getBookingsByUserId(req, res, next) {
        try {
            if (!req.user?.id || String(req.params.userId) !== String(req.user.id)) {
                return res.status(403).json({ success: false, message: 'Not allowed' });
            }

            const { page = 1, limit = 10, bookingType, trip } = req.query;

            const result = await this.bookingService.getBookingsByUserId(
                req.user.id,
                page,
                limit,
                bookingType || null,
                trip || null
            );

            return res.status(200).json({
                success: true,
                message: 'Bookings fetched successfully',
                data: result.bookings.map(toCustomerBooking),
                pagination: result.pagination,
                summary: result.summary,
                filterCounts: result.filterCounts
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookingController;