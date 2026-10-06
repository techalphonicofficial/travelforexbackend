const Booking = require('../models/Booking');

class BookingService {

    constructor(
        tripJackFlightService,
        tripJackHotelService,
        iciciPaymentService
    ) {
        this.tripJackFlightService = tripJackFlightService;
        this.tripJackHotelService = tripJackHotelService;
        this.iciciPaymentService = iciciPaymentService;
    }


    /**
     * Create booking + initiate payment
     */
     async createHotelBooking({
        userId = null,

        bookingType,
        provider,

        providerBookingId = null,
        providerReference = null,

        status = 'INITIATED',
        paymentStatus = 'PENDING',

        amount = null,
        currency = 'INR',

        correlationId = null,

        bookingData = null,
        paymentData = null,

        paymentRequestData = {}
    }) {

        if (!userId) {
            throw new Error('userId is required');
        }

        if (!bookingType) {
            throw new Error('bookingType is required');
        }

        if (!provider) {
            throw new Error('provider is required');
        }

        if (!amount) {
            throw new Error('amount is required');
        }


        /*
         * 1. Generate internal booking reference
         */
        const bookingReference =
            await this.generateBookingReference();


        /*
         * 2. Create booking first
         *
         * booking.id is required by Payment table.
         */
        const booking = await Booking.create({

            booking_reference:
                bookingReference,

            user_id:
                userId,

            booking_type:
                bookingType,

            provider,

            provider_booking_id:
                providerBookingId,

            provider_reference:
                providerReference,

            status,

            payment_status:
                paymentStatus,

            amount,

            currency,

            correlation_id:
                correlationId,

            booking_data:
                bookingData,

            payment_data:
                paymentData
        });

        try {

            /*
             * 3. Initiate ICICI payment
             *
             * Use the same ICICI service instance
             * injected by container.js.
             */
            const paymentResponse =
                await this.iciciPaymentService.initiateSale({

                    userId,

                    bookingId:
                        booking.id,
                    bookingRefrence: booking.booking_reference,
                    bookingType,

                    amount,

                    environment:
                        process.env.ICICI_ENVIRONMENT ||
                        'UAT',

                    requestData:
                        paymentRequestData
                });


            /*
             * 4. Save payment metadata
             * inside Booking table.
             */
            booking.payment_data = {

                paymentId:
                    paymentResponse.paymentId,

                merchantTxnNo:
                    paymentResponse.merchantTxnNo,

                gateway:
                    paymentResponse.gateway,

                status:
                    paymentResponse.status,

                tranCtx:
                    paymentResponse.response?.tranCtx ||
                    null,

                response:
                    paymentResponse.response ||
                    null
            };


            await booking.save();


            /*
             * 5. Return booking + payment
             */
            return {

                booking,

                payment:
                    paymentResponse
            };


        } catch (error) {

            /*
             * Payment initiation failed.
             *
             * Keep booking record for
             * tracking/debugging.
             */
            booking.status =
                'PAYMENT_INITIATION_FAILED';

            booking.payment_status =
                'FAILED';

            booking.payment_data = {

                error:
                    error.message
            };

            await booking.save();

            throw error;
        }
    }

    /**
 * Create internal booking + TripJack Review
 *
 * IMPORTANT:
 * Payment is NOT initiated here.
 */
    async createBooking({
        userId = null,
        bookingType,
        provider,
        providerBookingId = null,
        providerReference = null,
        status = 'INITIATED',
        paymentStatus = 'PENDING',
        amount = null,
        currency = 'INR',
        correlationId = null,
        bookingData = null,
        paymentData = null
    }) {
        

        // =========================================================
        // 1. BASIC VALIDATION
        // =========================================================

        if (!userId) {
            throw new Error(
                'userId is required'
            );
        }

        if (!bookingType) {
            throw new Error(
                'bookingType is required'
            );
        }

        if (!provider) {
            throw new Error(
                'provider is required'
            );
        }

        if (!amount) {
            throw new Error(
                'amount is required'
            );
        }


        // =========================================================
        // 2. GENERATE INTERNAL BOOKING REFERENCE
        // =========================================================

        const bookingReference =
            await this.generateBookingReference();


        // =========================================================
        // 3. CREATE INTERNAL BOOKING FIRST
        // =========================================================

        const booking =
            await Booking.create({

                booking_reference:
                    bookingReference,

                user_id:
                    userId,

                booking_type:
                    bookingType,

                provider:
                    provider,

                provider_booking_id:
                    providerBookingId,

                provider_reference:
                    providerReference,

                status:
                    status,

                payment_status:
                    paymentStatus,

                amount:
                    amount,

                currency:
                    currency,

                correlation_id:
                    correlationId,

                booking_data:
                    bookingData,

                payment_data:
                    paymentData
            });


        // =========================================================
        // 4. TRIPJACK VALIDATION / REVIEW
        // =========================================================

        try {

            const normalizedBookingType =
                String(
                    bookingType
                )
                    .trim()
                    .toUpperCase();


            // =====================================================
            // FLIGHT
            // =====================================================

            if (
                normalizedBookingType ===
                'FLIGHT'
            ) {

                if (
                    !this.tripJackFlightService
                ) {
                    throw new Error(
                        'TripJackFlightService is not configured'
                    );
                }


                const data =
                    bookingData || {};


                const passengers =
                    Array.isArray(
                        data.passengers
                    )
                        ? data.passengers
                        : [];


                const contact =
                    data.contact || {};


                const seatSelection =
                    data.seatSelection || {};


                // -------------------------------------------------
                // TripJack bookingId
                // -------------------------------------------------

                const tripJackBookingId =
                    providerBookingId ||
                    data?.bookingId ||
                    data?.tripJackBookingId ||
                    data?.review?.bookingId ||
                    null;


                if (!tripJackBookingId) {

                    throw new Error(
                        'TripJack bookingId is missing for Fare Validate'
                    );
                }


                // -------------------------------------------------
                // Passenger validation
                // -------------------------------------------------

                if (!passengers.length) {

                    throw new Error(
                        'Passenger details are missing'
                    );
                }


                // -------------------------------------------------
                // Contact details
                // -------------------------------------------------

                const email =
                    contact.email
                        ? String(
                            contact.email
                        ).replace(
                            /^mailto:/,
                            ''
                        )
                        : null;


                const phone =
                    contact.mobile
                        ? `${(
                            contact.countryCode ||
                            '+91'
                        ).replace(
                            '+',
                            ''
                        )}${contact.mobile}`
                        : null;


                // -------------------------------------------------
                // TripJack amount
                //
                // IMPORTANT:
                // Prefer tripJackAmount if frontend has supplied it.
                // Otherwise fallback to internal booking amount.
                // -------------------------------------------------

                const tripJackAmount =
                    Number(
                        data?.tripJackAmount ??
                        data?.fareAmount ??
                        amount
                    );


                if (
                    !Number.isFinite(
                        tripJackAmount
                    ) ||
                    tripJackAmount <= 0
                ) {

                    throw new Error(
                        'TripJack fare amount is missing or invalid'
                    );
                }


                // -------------------------------------------------
                // COMPLETE TRIPJACK FARE VALIDATE PAYLOAD
                // -------------------------------------------------

                const fareValidatePayload = {

                    bookingId:
                        tripJackBookingId,


                    paymentInfos: [
                        {
                            amount:
                                tripJackAmount
                        }
                    ],


                    deliveryInfo: {

                        emails:
                            email
                                ? [email]
                                : [],

                        contacts:
                            phone
                                ? [phone]
                                : []
                    },


                    contactInfo: {

                        email:
                            email,

                        phone:
                            phone
                    },


                    travellerInfo:
                        passengers.map(
                            (
                                passenger,
                                passengerIndex
                            ) => {

                                const passengerSeats =
                                    Array.isArray(
                                        seatSelection.seats
                                    )
                                        ? seatSelection.seats
                                            .filter(
                                                (item) =>
                                                    Number(
                                                        item.passengerIndex
                                                    ) ===
                                                    passengerIndex &&

                                                    item?.seat?.code &&

                                                    item?.sectorKey
                                            )
                                            .map(
                                                (item) => ({
                                                    key:
                                                        String(
                                                            item.sectorKey
                                                        ),

                                                    code:
                                                        String(
                                                            item.seat.code
                                                        )
                                                })
                                            )
                                        : [];


                                return {

                                    ti:
                                        passenger.title,

                                    pt:
                                        passenger.type,

                                    fN:
                                        passenger.firstName,

                                    lN:
                                        passenger.lastName,

                                    dob:
                                        passenger.dob,

                                    ...(passengerSeats.length >
                                        0 && {
                                        ssrSeatInfos:
                                            passengerSeats
                                    })
                                };
                            }
                        )
                };


                


                // -------------------------------------------------
                // CALL FARE VALIDATE
                // -------------------------------------------------

                const fareValidateResponse =
                    await this.tripJackFlightService
                        .fareValidate(
                            fareValidatePayload
                        );


                // -------------------------------------------------
                // CHECK FARE VALIDATE RESPONSE
                // -------------------------------------------------

                const fareValidateBody =
                    fareValidateResponse?.data ??
                    fareValidateResponse;


                const fareValidateStatus =
                    fareValidateBody?.status;


                if (
                    fareValidateStatus?.success ===
                    false
                ) {

                    throw new Error(
                        fareValidateBody
                            ?.errors?.[0]
                            ?.message ||
                        'TripJack fare validation failed'
                    );
                }


                if (
                    typeof fareValidateStatus ===
                    'string' &&
                    [
                        'FAILED',
                        'FAILURE',
                        'ERROR',
                        'UNAVAILABLE'
                    ].includes(
                        fareValidateStatus
                            .toUpperCase()
                    )
                ) {

                    throw new Error(
                        fareValidateBody
                            ?.errors?.[0]
                            ?.message ||
                        'TripJack fare validation failed'
                    );
                }


                // -------------------------------------------------
                // CHECK FARE ALERT
                // -------------------------------------------------

                const fareValidateAlerts =
                    Array.isArray(
                        fareValidateBody?.alerts
                    )
                        ? fareValidateBody.alerts
                        : [];


                const fareAlert =
                    fareValidateAlerts.find(
                        (alert) =>
                            String(
                                alert?.type || ''
                            ).toUpperCase() ===
                            'FAREALERT'
                    );


                if (fareAlert) {

                    throw new Error(
                        fareAlert.message ||
                        fareAlert.msg ||
                        'TripJack fare changed. Please restart booking.'
                    );
                }


                // -------------------------------------------------
                // SAVE FARE VALIDATE DATA
                // -------------------------------------------------

                booking.booking_data = {

                    ...(booking.booking_data || {}),

                    fareValidate: {

                        request:
                            fareValidatePayload,

                        response:
                            fareValidateResponse
                    },

                    fareValidateCompleted:
                        true,

                    fareValidatedAt:
                        new Date().toISOString()
                };


                await booking.save();


                // -------------------------------------------------
                // RETURN FLIGHT RESULT
                // -------------------------------------------------

                return {

                    success:
                        true,

                    booking: {

                        id:
                            booking.id,

                        bookingReference:
                            booking.booking_reference,

                        bookingType:
                            booking.booking_type,

                        provider:
                            booking.provider,

                        amount:
                            booking.amount,

                        currency:
                            booking.currency,

                        status:
                            booking.status,

                        paymentStatus:
                            booking.payment_status
                    },

                    validation:
                        fareValidateResponse
                };
            }


            // =====================================================
            // HOTEL
            // =====================================================

            if (
                normalizedBookingType ===
                'HOTEL'
            ) {

                if (
                    !this.tripJackHotelService
                ) {
                    throw new Error(
                        'TripJackHotelService is not configured'
                    );
                }


                // -------------------------------------------------
                // HOTEL REVIEW
                // -------------------------------------------------

                const reviewResponse =
                    await this.tripJackHotelService
                        .review(
                            bookingData
                        );



                // -------------------------------------------------
                // SAVE HOTEL REVIEW
                // -------------------------------------------------

                booking.booking_data = {

                    ...(booking.booking_data || {}),

                    tripJackReview:
                        reviewResponse,

                    reviewCompleted:
                        true,

                    reviewedAt:
                        new Date().toISOString()
                };


                await booking.save();


                // -------------------------------------------------
                // RETURN HOTEL RESULT
                // -------------------------------------------------

                return {

                    success:
                        true,

                    booking: {

                        id:
                            booking.id,

                        bookingReference:
                            booking.booking_reference,

                        bookingType:
                            booking.booking_type,

                        provider:
                            booking.provider,

                        amount:
                            booking.amount,

                        currency:
                            booking.currency,

                        status:
                            booking.status,

                        paymentStatus:
                            booking.payment_status
                    },

                    review:
                        reviewResponse
                };
            }


            // =====================================================
            // UNSUPPORTED BOOKING TYPE
            // =====================================================

            throw new Error(
                `Unsupported booking type: ${bookingType}`
            );

        } catch (error) {

            console.error(
                'TripJack validation/review failed:',
                {
                    bookingId:
                        booking.id,

                    bookingType:
                        bookingType,

                    error:
                        error.message
                }
            );


            // -----------------------------------------------------
            // UPDATE INTERNAL BOOKING FAILURE
            // -----------------------------------------------------

            await booking.update({

                status:
                    'REVIEW_FAILED',

                payment_status:
                    'PENDING',

                booking_data: {

                    ...(booking.booking_data || {}),

                    validationCompleted:
                        false,

                    reviewCompleted:
                        false,

                    validationError: {

                        message:
                            error.message,

                        failedAt:
                            new Date().toISOString()
                    }
                }
            });


            throw error;
        }
    }


    async continueToPay({
        bookingId,
        environment = 'UAT'
    }) {

        if (!bookingId) {
            throw new Error('bookingId is required');
        }

        // ----------------------------------------
        // 1. Get existing booking
        // ----------------------------------------

        const booking = await this.findById(bookingId);

        if (!booking) {
            throw new Error(
                `Booking not found: ${bookingId}`
            );
        }

        // ----------------------------------------
        // 2. Basic validation
        // ----------------------------------------

        if (!booking.amount) {
            throw new Error(
                'Booking amount is missing'
            );
        }

        if (booking.payment_status === 'SUCCESS') {
            throw new Error(
                'Payment has already been completed for this booking'
            );
        }

        // ----------------------------------------
        // 3. Initiate payment
        // ----------------------------------------
        //  userId,
        // bookingId = null,
        // bookingRefrence = null,
        // customTripId = null,
        // amount,
        // environment = 'UAT',
        // requestData = {},
        // bookingType

        console.log(
            'Initiating payment for booking:',
            {
                bookingId: booking.id,
                bookingRefrence:
                    booking.booking_reference,
                amount: booking.amount,
                currency: booking.currency,
                environment
            }
        );

        const paymentResponse =
            await this.iciciPaymentService.initiateSale({
                userId: booking.user_id,
                bookingId: booking.id,
                bookingRefrence: booking.booking_reference,
                amount: Number(booking.amount),
                currency: booking.currency || 'INR',
                environment
            });

        // ----------------------------------------
        // 4. Return booking + payment
        // ----------------------------------------

        return {
            success: true,

            booking: {
                id: booking.id,
                bookingReference:
                    booking.booking_reference,

                bookingType:
                    booking.booking_type,

                provider:
                    booking.provider,

                amount:
                    booking.amount,

                currency:
                    booking.currency,

                status:
                    booking.status,

                paymentStatus:
                    booking.payment_status
            },

            payment: paymentResponse
        };
    }


    /**
     * Generate internal booking reference
     */
    async generateBookingReference() {

        const date = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');

        const random = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return `BK-${date}-${random}`;
    }


    /**
     * Find booking by internal ID
     */
    async findById(id) {
        return Booking.findByPk(id);
    }


    /**
     * Find booking by Merchant Transaction Number
     */
    async findByMerchantTxnNo(merchantTxnNo) {

        return Booking.findOne({
            where: {
                'payment_data.merchantTxnNo':
                    merchantTxnNo
            }
        });
    }


    /**
     * Find booking by internal booking reference
     */
    async findByBookingReference(bookingReference) {

        return Booking.findOne({
            where: {
                booking_reference:
                    bookingReference
            }
        });
    }


    /**
     * Find booking by provider booking ID
     */
    async findByProviderBookingId(
        providerBookingId
    ) {

        return Booking.findOne({
            where: {
                provider_booking_id:
                    providerBookingId
            }
        });
    }


    /**
     * Update booking status
     */
    async updateStatus(id, status) {

        const booking =
            await this.findById(id);

        if (!booking) {
            throw new Error(
                'Booking not found'
            );
        }

        booking.status = status;

        await booking.save();

        return booking;
    }


    /**
     * Update payment status
     */
    async updatePaymentStatus(
        id,
        paymentStatus,
        paymentData = null
    ) {

        const booking =
            await this.findById(id);

        if (!booking) {
            throw new Error(
                'Booking not found'
            );
        }

        booking.payment_status =
            paymentStatus;

        if (paymentData) {

            booking.payment_data = {
                ...(booking.payment_data || {}),
                ...paymentData
            };
        }

        await booking.save();

        return booking;
    }


    /**
     * Update provider booking ID
     */
    async updateProviderBookingId(
        id,
        providerBookingId
    ) {

        const booking =
            await this.findById(id);

        if (!booking) {
            throw new Error(
                'Booking not found'
            );
        }

        booking.provider_booking_id =
            providerBookingId;

        await booking.save();

        return booking;
    }


    /**
     * Update booking data
     */
    async updateBookingData(
        id,
        bookingData
    ) {

        const booking =
            await this.findById(id);

        if (!booking) {
            throw new Error(
                'Booking not found'
            );
        }

        booking.booking_data = {
            ...(booking.booking_data || {}),
            ...(bookingData || {})
        };

        await booking.save();

        return booking;
    }



    async getBookingsByUserId(
        userId = null,
        page = 1,
        limit = 10,
        bookingType = null
    ) {
        page = Math.max(1, parseInt(page, 10) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        const offset = (page - 1) * limit;

        const where = {};

        // Filter by user only when userId is provided
        if (userId !== null && userId !== undefined && userId !== '') {
            where.user_id = userId;
        }

        // Filter by booking type only when provided
        if (bookingType !== null && bookingType !== undefined && bookingType !== '') {
            const normalizedType = String(bookingType).trim().toUpperCase();

            if (!['HOTEL', 'FLIGHT'].includes(normalizedType)) {
                throw new Error('Invalid bookingType. Use HOTEL or FLIGHT');
            }

            where.booking_type = normalizedType;
        }

        const { count, rows } = await Booking.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        return {
            bookings: rows,
            pagination: {
                currentPage: page,
                limit,
                totalRecords: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
}


module.exports = BookingService;