const bookingService = require("../services/bookingService");

class BookingController {

    async createBooking(req, res) {
        try {
            const {
                bookingType,
                provider,
                providerBookingId,
                providerReference,
                amount,
                currency,
                correlationId,
                bookingData,
                paymentData,
            } = req.body;

            const booking = await bookingService.createBooking({
                userId: req.user?.id || null,

                bookingType,
                provider,
                providerBookingId,
                providerReference,

                amount,
                currency: currency || 'INR',

                correlationId,

                bookingData,
                paymentData,
            });

            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking,
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
                    error.message ||
                    'Unable to create booking',
            });
        }
    }

    async getBooking(req, res) {
        try {
            const { id } = req.params;

            const booking =
                await bookingService.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: booking,
            });

        } catch (error) {
            console.error(
                'Get Booking Error:',
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    'Unable to fetch booking',
            });
        }
    }
}

module.exports = new BookingController();