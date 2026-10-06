class BookingController {

    constructor(bookingService) {
        this.bookingService = bookingService;
    }


    /**
     * Create Booking
     */
    async createBooking(req, res) {
        console.log('createBooking called',req.body);

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

                    userId,

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

                data:
                    booking
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
                    'Unable to create booking'
            });
        }
    }


     async createHotelBooking(req, res) {
        try {
            const {
                userId,
                bookingType,
                provider,
                providerBookingId,
                providerReference,
                amount,
                currency,
                bookingData,
                paymentData
            } = req.body;

            const booking = await this.bookingService.createHotelBooking({
                userId,
                bookingType,
                provider,
                providerBookingId,
                providerReference,
                amount,
                currency: currency || 'INR',
                correlationId: req.body.bookingData.tripjack.correlationId,
                bookingData,
                paymentData
            });

            return res.status(201).json({
                success: true,
                message: 'Hotel booking created successfully',
                data: booking
            });
        } catch (error) {
            console.error('Create Hotel Booking Error:', error);
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to create hotel booking'
            });
        }
    }
     
    async continueToPay(req, res) {
        console.log('continueToPay called');
        try {
            const { bookingId } = req.params;

            const result = await this.bookingService.continueToPay({ bookingId , environment: 'UAT' });

            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: result
            });
        } catch (error) {
            console.error('Continue to Pay Error:', error);
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to process payment'
            });
        }
    }   

    /**
     * Get Booking By ID
     */
    async getBooking(req, res) {

        try {

            const { id } =
                req.params;


            const booking =
                await this.bookingService.findById(
                    id
                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Booking not found'
                });
            }


            return res.status(200).json({

                success: true,

                data:
                    booking
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
                    'Unable to fetch booking'
            });
        }
    }

      /**
     * Get Booking BookingRefrence
     */
    async getBookingByReference(req, res) {

        try {

            const { id } =
                req.params;


            const booking =
                await this.bookingService.findByBookingReference(
                    id
                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Booking not found'
                });
            }


            return res.status(200).json({

                success: true,

                data:
                    booking
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
                    'Unable to fetch booking'
            });
        }
    }



   async getBookingsByUserId(req, res, next) {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, bookingType } = req.query;

        const result = await this.bookingService.getBookingsByUserId(
            userId || null,
            page,
            limit,
            bookingType || null
        );

        return res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            data: result.bookings,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}
}


module.exports = BookingController;