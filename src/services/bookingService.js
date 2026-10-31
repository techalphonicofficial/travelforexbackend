const Booking = require('../models/Booking');
const { ticketState } = require('../utils/flightTickets');
const { isValidNationalNumber } = require('../utils/phone');

/*
 * Fare-validate request with personal data masked, for logs / admin:
 * keeps the shape and formats (title, type, dates, codes, add-ons, amount)
 * that usually explain a supplier "invalid/bad data" error.
 */
const maskFareValidatePayload = (payload = {}) => {
    const keepEnds = (value, start = 1, end = 1) => {
        const text = String(value ?? '');
        if (!text) return text;
        return text.length <= start + end ? '*'.repeat(text.length) : `${text.slice(0, start)}${'*'.repeat(text.length - start - end)}${text.slice(-end)}`;
    };
    return {
        ...payload,
        deliveryInfo: payload.deliveryInfo && {
            emails: (payload.deliveryInfo.emails || []).map((email) => String(email).replace(/^(.).*(@.*)$/, '$1***$2')),
            contacts: (payload.deliveryInfo.contacts || []).map((phone) => keepEnds(phone, 3, 2)),
        },
        ...(payload.contactInfo && { contactInfo: { ...payload.contactInfo, ecn: keepEnds(payload.contactInfo.ecn), contacts: (payload.contactInfo.contacts || []).map((phone) => keepEnds(phone, 3, 2)) } }),
        ...(payload.gstInfo && { gstInfo: { ...payload.gstInfo, gstNumber: keepEnds(payload.gstInfo.gstNumber, 2, 2), mobile: keepEnds(payload.gstInfo.mobile, 2, 2), email: payload.gstInfo.email && '***' } }),
        travellerInfo: (payload.travellerInfo || []).map((traveller) => ({
            ...traveller,
            fN: keepEnds(traveller.fN),
            lN: keepEnds(traveller.lN),
            ...(traveller.pNum && { pNum: keepEnds(traveller.pNum, 1, 2) }),
            ...(traveller.pan && { pan: keepEnds(traveller.pan, 2, 1) }),
            ...(traveller.di && { di: keepEnds(traveller.di, 1, 1) }),
        })),
    };
};

// Last travel date of a booking (hotel check-out, flight return / departure)
const TRIP_END_SQL = `COALESCE(
    booking_data #>> '{search,checkOut}',
    booking_data #>> '{search,returnDate}',
    booking_data #>> '{search,checkIn}',
    booking_data #>> '{search,departureDate}',
    booking_data #>> '{review,tripInfos,0,sI,0,dt}'
)`;
const TRIP_FILTERS = ['UPCOMING', 'COMPLETED', 'PENDING', 'CANCELLED'];
const PENDING_STATUSES = ['INITIATED', 'PAYMENT_PENDING', 'PENDING', 'BOOKING_IN_PROGRESS', 'ON_HOLD'];
const CLOSED_STATUSES = ['CANCELLED', 'REFUNDED', 'BOOKING_FAILED', 'PAYMENT_FAILED', 'PAYMENT_NOT_COMPLETED', 'REVIEW_FAILED'];
// today in India (travel dates are local dates); always "YYYY-MM-DD"
const indiaToday = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

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
     * Hotel guests must match the reviewed option BEFORE taking money
     * (the same rules are applied again when booking after payment).
     */
    validateHotelGuests(option, bookingData) {
        const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Master'];
        const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const NAME_REGEX = /^[A-Za-z ]{1,50}$/;

        const guests = Array.isArray(bookingData?.guests) ? bookingData.guests : [];
        if (!guests.length) throw new Error('Guest details are missing');

        const rooms = Array.isArray(option?.roomInfo) ? option.roomInfo : [];
        const panRequired = option?.compliance?.panRequired === true;
        const passportRequired = option?.compliance?.passportRequired === true;

        rooms.forEach((room, roomIndex) => {
            const inRoom = guests.filter((g) => Number(g.roomIndex ?? 0) === roomIndex);
            const adults = inRoom.filter((g) => String(g.type).toUpperCase() === 'ADULT').length;
            const children = inRoom.length - adults;
            if (adults !== Number(room.adults || 0) || children !== Number(room.children || 0)) {
                throw new Error(`Room ${roomIndex + 1}: guest details do not match the selected room`);
            }
        });

        // one PAN per booking: the lead guest's (when the hotel asks for PAN)
        const leadGuest = guests.find((g) => g.isPrimary) ||
            guests.find((g) => Number(g.roomIndex ?? 0) === 0 && String(g.type).toUpperCase() === 'ADULT');
        if (panRequired && !PAN_REGEX.test(String(leadGuest?.pan || '').trim().toUpperCase())) {
            throw new Error('A valid PAN of the lead guest is required for this hotel');
        }

        guests.forEach((guest) => {
            const label = `Room ${Number(guest.roomIndex ?? 0) + 1} guest`;
            const type = String(guest.type || '').toUpperCase();
            if (!TITLES.includes(String(guest.title || '').replace(/\./g, ''))) throw new Error(`${label}: select title`);
            if (!['ADULT', 'CHILD'].includes(type)) throw new Error(`${label}: invalid guest type`);
            if (!NAME_REGEX.test(String(guest.firstName || '').trim()) || !NAME_REGEX.test(String(guest.lastName || '').trim())) {
                throw new Error(`${label}: enter first and last name using letters only`);
            }
            if (guest.pan && !PAN_REGEX.test(String(guest.pan).trim().toUpperCase())) {
                throw new Error(`${label}: PAN is not valid`);
            }
            if (passportRequired && !String(guest.passportNumber || '').trim()) {
                throw new Error(`${label}: passport number is required for this hotel`);
            }
        });

        // Lead guest names must be different across rooms
        const leads = rooms.map((_, roomIndex) => {
            const lead = guests.find((g) => Number(g.roomIndex ?? 0) === roomIndex && String(g.type).toUpperCase() === 'ADULT');
            return lead ? `${lead.firstName} ${lead.lastName}`.trim().toLowerCase() : '';
        });
        if (new Set(leads).size !== leads.length) {
            throw new Error('Lead guest name must be different for each room');
        }

        const primary = bookingData?.primaryGuest || guests.find((g) => g.isPrimary) || guests[0];
        if (!EMAIL_REGEX.test(String(primary?.email || '').trim())) throw new Error('Enter a valid email address');
        if (!isValidNationalNumber(primary?.mobile, primary?.countryCode)) throw new Error('Enter a valid mobile number');
    }

    /**
     * Create hotel booking + initiate payment.
     *
     * The price is NOT taken from the browser: the server reviews the
     * selected room with the supplier and charges that exact amount.
     */
    async createHotelBooking({
        userId = null,
        bookingType = 'HOTEL',
        provider = 'TRIPJACK',
        amount: clientAmount = null,
        currency = 'INR',
        correlationId = null,
        bookingData = null,
        paymentRequestData = {}
    }) {

        if (!userId) {
            const error = new Error('Please log in to continue');
            error.status = 401;
            throw error;
        }

        if (String(bookingType).toUpperCase() !== 'HOTEL') {
            throw new Error('Invalid booking type');
        }

        if (!this.tripJackHotelService) {
            throw new Error('Hotel service is not configured');
        }

        const data = bookingData || {};
        const supplier = data.tripjack || data.tripJack || {};
        const hid = String(
            supplier.review?.hotelId ||
            data.hotel?.tjHotelId ||
            data.hotel?.hotelId ||
            data.hotel?.hid ||
            ''
        );
        const reviewCorrelationId = supplier.correlationId || supplier.review?.correlationId || correlationId;
        // The pricing (detail) optionId can be reviewed again; the optionId
        // returned by a review cannot (supplier: "optionId was not found").
        const optionIds = [...new Set([
            supplier.selectedOption?.optionId,
            supplier.review?.option?.optionId
        ].filter(Boolean))];

        if (!hid || !optionIds.length || !reviewCorrelationId) {
            throw new Error('Selected room details are missing. Please select the room again.');
        }

        // -------------------------------------------------
        // 1. Server-side review (authoritative price + rules)
        // -------------------------------------------------
        let review = null;
        let lastError = null;

        for (const optionId of optionIds) {
            try {
                const response = await this.tripJackHotelService.review({
                    optionId,
                    reviewHash: supplier.reviewHash || undefined,
                    correlationId: reviewCorrelationId,
                    hid
                });
                const body = response?.data ?? response;
                if (body?.status?.success !== false && body?.bookingId && body?.option?.pricing?.totalPrice) {
                    review = body;
                    break;
                }
                lastError = new Error(body?.errors?.[0]?.message || 'Room is no longer available');
            } catch (error) {
                lastError = error;
            }
        }

        if (!review) {
            const error = new Error('This room is no longer available at this price. Please select a room again.');
            error.status = 409;
            error.cause = lastError;
            throw error;
        }

        const amount = Math.round((Number(review.option.pricing.totalPrice) + Number.EPSILON) * 100) / 100;
        const priceChanged = clientAmount != null && Math.abs(Number(clientAmount) - amount) >= 1;

        // -------------------------------------------------
        // 2. Guest checks before payment
        // -------------------------------------------------
        try {
            this.validateHotelGuests(review.option, data);
        } catch (error) {
            error.status = 400; // guest data problem, not a server error
            throw error;
        }

        // -------------------------------------------------
        // 3. Booking (amount from the supplier review)
        // -------------------------------------------------
        const bookingReference = await this.generateBookingReference();

        const booking = await Booking.create({
            booking_reference: bookingReference,
            user_id: userId,
            booking_type: 'HOTEL',
            provider: provider || 'TRIPJACK',
            provider_booking_id: String(review.bookingId),
            provider_reference: null,
            status: 'INITIATED',
            payment_status: 'PENDING',
            amount,
            currency: currency || 'INR',
            correlation_id: reviewCorrelationId,
            booking_data: {
                ...data,
                tripjack: {
                    ...supplier,
                    correlationId: reviewCorrelationId,
                    bookingId: review.bookingId,
                    review,
                    serverReviewedAt: new Date().toISOString()
                },
                amountBreakup: {
                    total: amount,
                    base: Number(review.option.pricing.basePrice ?? amount),
                    taxes: Number(review.option.pricing.taxes || 0) + Number(review.option.pricing.mf || 0) + Number(review.option.pricing.mft || 0),
                    discount: Number(review.option.pricing.discount || 0)
                }
            },
            payment_data: null
        });

        try {
            // -------------------------------------------------
            // 4. Initiate ICICI payment for the server amount
            // -------------------------------------------------
            const primary = data.primaryGuest || {};
            const paymentResponse = await this.iciciPaymentService.initiateSale({
                userId,
                bookingId: booking.id,
                bookingRefrence: booking.booking_reference,
                bookingType: 'HOTEL',
                amount,
                environment: process.env.ICICI_ENVIRONMENT || 'UAT',
                requestData: {
                    ...paymentRequestData,
                    ...(primary.email && { customerEmailID: String(primary.email).trim() }),
                    ...(primary.mobile && { customerMobileNo: `91${String(primary.mobile).replace(/\D/g, '').slice(-10)}` }),
                    ...(primary.firstName && { customerName: `${primary.firstName} ${primary.lastName || ''}`.trim() })
                }
            });

            booking.payment_data = {
                paymentId: paymentResponse.paymentId,
                merchantTxnNo: paymentResponse.merchantTxnNo,
                gateway: paymentResponse.gateway,
                status: paymentResponse.status,
                tranCtx: paymentResponse.response?.tranCtx || null,
                response: paymentResponse.response || null
            };

            await booking.save();

            return {
                booking: {
                    id: booking.id,
                    booking_reference: booking.booking_reference,
                    status: booking.status,
                    payment_status: booking.payment_status,
                    amount
                },
                payment: {
                    paymentId: paymentResponse.paymentId,
                    merchantTxnNo: paymentResponse.merchantTxnNo,
                    gateway: paymentResponse.gateway,
                    status: paymentResponse.status,
                    response: {
                        redirectURI: paymentResponse.response?.redirectURI || null,
                        tranCtx: paymentResponse.response?.tranCtx || null
                    }
                },
                priceChanged,
                amount
            };

        } catch (error) {
            booking.status = 'PAYMENT_INITIATION_FAILED';
            booking.payment_status = 'FAILED';
            booking.payment_data = { error: error.message };
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

                // holds the airline PNR once it is issued, never the
                // supplier booking id (that is provider_booking_id)
                provider_reference:
                    providerReference && !/^TJ[A-Z]?\d{6,}$/i.test(String(providerReference).trim())
                        ? providerReference
                        : null,

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
                // Contact details (TripJack deliveryInfo)
                // -------------------------------------------------

                const toPhone = (countryCode, number) => {
                    const digits = String(number || '').replace(/\D/g, '');
                    if (!digits) return null;
                    const code = String(countryCode || '+91').replace(/\D/g, '') || '91';
                    return `+${code}${digits.slice(-14)}`;
                };

                const email =
                    contact.email
                        ? String(contact.email).replace(/^mailto:/, '').trim()
                        : null;

                const phone = toPhone(contact.countryCode, contact.mobile);

                if (!email || !phone) {
                    throw new Error('Contact email and mobile number are required');
                }
                if (!isValidNationalNumber(contact.mobile, contact.countryCode)) {
                    const error = new Error('Enter a valid mobile number');
                    error.status = 400;
                    throw error;
                }


                // -------------------------------------------------
                // Traveller validation against TripJack review
                // conditions (server side, never trust the client)
                // -------------------------------------------------

                const conditions = data?.review?.conditions || {};
                const isDomestic = data?.review?.searchQuery?.isDomestic !== false;
                const passportRequired = !isDomestic || Boolean(conditions?.pcs?.pm);
                const panRequired = !isDomestic || Boolean(conditions?.ipa);
                const dobRequired = {
                    ADULT: Boolean(conditions?.dob?.adobr) || !isDomestic,
                    CHILD: Boolean(conditions?.dob?.cdobr) || !isDomestic,
                    INFANT: true
                };
                const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
                const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

                passengers.forEach((passenger, index) => {
                    const who = `Traveller ${index + 1}`;
                    const type = String(passenger?.type || '').toUpperCase();

                    if (!['ADULT', 'CHILD', 'INFANT'].includes(type)) {
                        throw new Error(`${who}: invalid passenger type`);
                    }
                    if (
                        !passenger?.title ||
                        !String(passenger?.firstName || '').trim() ||
                        !String(passenger?.lastName || '').trim()
                    ) {
                        throw new Error(`${who}: title, first name and last name are required`);
                    }
                    if (dobRequired[type] && !DATE_REGEX.test(String(passenger?.dob || ''))) {
                        throw new Error(`${who}: date of birth is required`);
                    }
                    if (
                        passportRequired &&
                        (
                            !passenger?.passportNumber ||
                            !DATE_REGEX.test(String(passenger?.passportExpiry || '')) ||
                            !passenger?.nationality
                        )
                    ) {
                        throw new Error(`${who}: passport number, expiry date and nationality are required`);
                    }
                });

                const leadPan = String(passengers[0]?.pan || '').trim().toUpperCase();


                // -------------------------------------------------
                // Add-ons (TripJack SSR): seat / meal / baggage / extra
                // Each item: { passengerIndex, type, key (segment id), code }
                // Prices are NOT taken from the client, see below.
                // -------------------------------------------------

                // Extra services (Fast Forward etc.) make TripJack fare-validate fail with 810,
                // so they stay off unless TRIPJACK_EXTRA_SERVICES=true.
                const SSR_FIELDS = {
                    SEAT: 'ssrSeatInfos',
                    MEAL: 'ssrMealInfos',
                    BAGGAGE: 'ssrBaggageInfos',
                    ...(process.env.TRIPJACK_EXTRA_SERVICES === 'true' && { EXTRA: 'ssrExtraServiceInfos' })
                };

                const legacySeats =
                    Array.isArray(seatSelection.seats)
                        ? seatSelection.seats.map((item) => ({
                            passengerIndex: item?.passengerIndex,
                            type: 'SEAT',
                            key: item?.sectorKey,
                            code: item?.seat?.code
                        }))
                        : [];

                const addOns =
                    (Array.isArray(data.addOns) ? data.addOns : legacySeats)
                        .map((item) => ({
                            passengerIndex: Number(item?.passengerIndex),
                            type: String(item?.type || '').toUpperCase(),
                            key: String(item?.key || '').trim(),
                            code: String(item?.code || '').trim()
                        }))
                        .filter((item) => item.key && item.code);

                const addOnSlots = new Set();
                const takenSeats = new Set();

                addOns.forEach((item) => {
                    const passenger = passengers[item.passengerIndex];

                    if (passenger && item.type === 'EXTRA' && !SSR_FIELDS.EXTRA) {
                        throw new Error('Additional services such as Fast Forward are currently unavailable. Please remove them and try again.');
                    }
                    if (!passenger || !SSR_FIELDS[item.type]) {
                        throw new Error('Invalid add-on selection');
                    }
                    if (String(passenger.type).toUpperCase() === 'INFANT') {
                        throw new Error('Add-ons cannot be selected for infants');
                    }

                    // one seat / meal / baggage per traveller per segment
                    const slot = item.type === 'EXTRA'
                        ? `${item.passengerIndex}|EXTRA|${item.key}|${item.code}`
                        : `${item.passengerIndex}|${item.type}|${item.key}`;
                    if (addOnSlots.has(slot)) {
                        throw new Error('Only one add-on of each type is allowed per traveller per flight');
                    }
                    addOnSlots.add(slot);

                    if (item.type === 'SEAT') {
                        const seatId = `${item.key}|${item.code}`;
                        if (takenSeats.has(seatId)) {
                            throw new Error(`Seat ${item.code} is selected for more than one traveller`);
                        }
                        takenSeats.add(seatId);
                    }
                });

                if (panRequired && !PAN_REGEX.test(leadPan)) {
                    throw new Error('A valid PAN of the lead traveller is required for this booking');
                }


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
                // COMPLETE TRIPJACK BOOK PAYLOAD
                // Fare-validated now; the same payload is booked
                // after payment.
                // -------------------------------------------------

                const emergency = data?.emergencyContact || null;
                const emergencyPhone = emergency ? toPhone('+91', emergency.mobile) : null;
                const gstInfo = data?.gstInfo || null;

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
                        emails: [email],
                        contacts: [phone]
                    },

                    // Emergency contact (only when the airline asks: conditions.iecr)
                    ...(emergency?.name && {
                        contactInfo: {
                            ecn: String(emergency.name).trim(),
                            ...(emergencyPhone && { contacts: [emergencyPhone] })
                        }
                    }),

                    ...(gstInfo?.gstNumber && gstInfo?.registeredName && {
                        gstInfo: {
                            gstNumber: String(gstInfo.gstNumber).trim().toUpperCase(),
                            registeredName: String(gstInfo.registeredName).trim().slice(0, 35),
                            ...(gstInfo.email && { email: String(gstInfo.email).trim() }),
                            ...(gstInfo.mobile && { mobile: String(gstInfo.mobile).replace(/\D/g, '') }),
                            ...(gstInfo.address && { address: String(gstInfo.address).trim().slice(0, 70) })
                        }
                    }),

                    travellerInfo:
                        passengers.map(
                            (
                                passenger,
                                passengerIndex
                            ) => {

                                const passengerSsr = {};

                                addOns
                                    .filter((item) => item.passengerIndex === passengerIndex)
                                    .forEach((item) => {
                                        const field = SSR_FIELDS[item.type];
                                        passengerSsr[field] = [
                                            ...(passengerSsr[field] || []),
                                            { key: item.key, code: item.code }
                                        ];
                                    });

                                const passportNumber =
                                    String(passenger.passportNumber || '').trim().toUpperCase();

                                return {

                                    ti:
                                        passenger.title,

                                    pt:
                                        String(passenger.type).toUpperCase(),

                                    fN:
                                        String(passenger.firstName).trim(),

                                    lN:
                                        String(passenger.lastName).trim(),

                                    ...(passenger.dob && {
                                        dob: passenger.dob
                                    }),

                                    // Passport only when collected (international / airline asks)
                                    ...(passportNumber && {
                                        pNum: passportNumber,
                                        ...(passenger.passportExpiry && { eD: passenger.passportExpiry }),
                                        ...(passenger.nationality && { pNat: passenger.nationality }),
                                        ...(passenger.passportIssueDate && { pid: passenger.passportIssueDate })
                                    }),

                                    // One PAN per booking, on the lead traveller
                                    ...(passengerIndex === 0 && PAN_REGEX.test(leadPan) && {
                                        pan: leadPan
                                    }),

                                    // Student / senior citizen ID
                                    ...(passenger.documentId && {
                                        di: String(passenger.documentId).trim()
                                    }),

                                    ...passengerSsr
                                };
                            }
                        )
                };


                // -------------------------------------------------
                // CALL FARE VALIDATE
                // -------------------------------------------------

                let fareValidateResponse;
                try {
                    fareValidateResponse =
                        await this.tripJackFlightService
                            .fareValidate(
                                fareValidatePayload
                            );
                } catch (error) {
                    // what was sent (personal data masked), to see why the supplier rejected it
                    error.sentPayload = maskFareValidatePayload(fareValidatePayload);
                    throw error;
                }


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
                // AMOUNT TO CHARGE (server side only)
                // fare TF + add-on prices, both taken from the
                // TripJack fare-validate response, never the client.
                // -------------------------------------------------

                const validatedFare = Number(
                    fareValidateBody?.totalPriceInfo?.totalFareDetail?.fC?.TF
                );

                if (!Number.isFinite(validatedFare) || validatedFare <= 0) {
                    throw new Error('Unable to confirm the fare with the airline. Please try again.');
                }

                const ssrCatalog = new Map();

                (Array.isArray(fareValidateBody?.tripInfos) ? fareValidateBody.tripInfos : [])
                    .forEach((trip) =>
                        (Array.isArray(trip?.sI) ? trip.sI : []).forEach((segment) => {
                            Object.entries(segment?.ssrInfo || {}).forEach(([ssrType, options]) => {
                                const type = ['SEAT', 'MEAL', 'BAGGAGE'].includes(ssrType) ? ssrType : 'EXTRA';
                                (Array.isArray(options) ? options : []).forEach((option) => {
                                    ssrCatalog.set(
                                        `${segment.id}|${type}|${option?.code}`,
                                        Number(option?.amount || 0)
                                    );
                                });
                            });
                        })
                    );

                const addOnTotal = addOns.reduce((sum, item) => {
                    const price = ssrCatalog.get(`${item.key}|${item.type}|${item.code}`);
                    if (price === undefined) {
                        throw new Error(`Selected ${item.type.toLowerCase()} ${item.code} is no longer available. Please choose again.`);
                    }
                    return sum + price;
                }, 0);

                // Mandatory add-ons (airline rule from conditions)
                const validatedConditions = fareValidateBody?.conditions || conditions;
                const mandatory = {
                    SEAT: Boolean(validatedConditions?.ifsm),
                    MEAL: Boolean(validatedConditions?.ifmm),
                    BAGGAGE: Boolean(validatedConditions?.ifbm)
                };
                const segmentIds = [...new Set([...ssrCatalog.keys()].map((id) => id.split('|')[0]))];

                Object.entries(mandatory).forEach(([type, required]) => {
                    if (!required) return;
                    passengers.forEach((passenger, index) => {
                        if (String(passenger.type).toUpperCase() === 'INFANT') return;
                        segmentIds.forEach((segmentId) => {
                            const offered = [...ssrCatalog.keys()].some((id) => id.startsWith(`${segmentId}|${type}|`));
                            if (offered && !addOnSlots.has(`${index}|${type}|${segmentId}`)) {
                                throw new Error(`${type.toLowerCase()} selection is mandatory for every traveller on this flight`);
                            }
                        });
                    });
                });

                // Re-check traveller documents against the airline's own
                // (fare-validated) conditions, not the client copy.
                const validatedDomestic = fareValidateBody?.searchQuery?.isDomestic !== false;
                const validatedPassport = !validatedDomestic || Boolean(validatedConditions?.pcs?.pm);
                const validatedPan = !validatedDomestic || Boolean(validatedConditions?.ipa);

                passengers.forEach((passenger, index) => {
                    const type = String(passenger.type).toUpperCase();
                    const needsDob =
                        type === 'INFANT' ||
                        !validatedDomestic ||
                        (type === 'ADULT' && validatedConditions?.dob?.adobr) ||
                        (type === 'CHILD' && validatedConditions?.dob?.cdobr);

                    if (needsDob && !DATE_REGEX.test(String(passenger.dob || ''))) {
                        throw new Error(`Traveller ${index + 1}: date of birth is required`);
                    }
                    if (validatedPassport && (!passenger.passportNumber || !DATE_REGEX.test(String(passenger.passportExpiry || '')))) {
                        throw new Error(`Traveller ${index + 1}: passport details are required`);
                    }
                });

                if (validatedPan && !PAN_REGEX.test(leadPan)) {
                    throw new Error('A valid PAN of the lead traveller is required for this booking');
                }

                const chargeAmount = Math.round((validatedFare + addOnTotal) * 100) / 100;

                // Same amount goes to the payment gateway and to TripJack book
                fareValidatePayload.paymentInfos = [{ amount: chargeAmount }];
                booking.amount = chargeAmount;


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

                    amountBreakup: {
                        fare: validatedFare,
                        addOns: addOnTotal,
                        total: chargeAmount
                    },

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

                    amountBreakup: {
                        fare: validatedFare,
                        addOns: addOnTotal,
                        total: chargeAmount
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

                        // supplier error code + masked request (admin view only)
                        ...(error.code && { code: error.code }),
                        ...(error.sentPayload && { request: error.sentPayload }),

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
        userId = null,
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

        // Only the owner can pay, and only for a booking whose
        // fare (and amount) was confirmed with the airline.
        if (userId !== null && String(booking.user_id) !== String(userId)) {
            const error = new Error('Booking not found');
            error.status = 404;
            throw error;
        }

        if (
            String(booking.booking_type).toUpperCase() === 'FLIGHT' &&
            (
                booking.status === 'REVIEW_FAILED' ||
                !booking.booking_data?.fareValidateCompleted
            )
        ) {
            throw new Error('Fare is not confirmed for this booking. Please review your flight again.');
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
     * Booking still waiting for payment: the gateway callback may never
     * come (customer closed the page). Ask ICICI (at most every 30s); after
     * 30 minutes without a result show "payment not completed".
     */
    async refreshPaymentStatus(booking) {
        try {
            if (!booking || booking.status !== 'INITIATED' || booking.payment_status !== 'PENDING') {
                return booking;
            }

            const Payment = require('../models/Payment');
            const payment = await Payment.findOne({
                where: { booking_id: booking.id },
                order: [['created_at', 'DESC']]
            });

            const startedAt = Date.parse(payment?.created_at || booking.created_at);
            const age = Date.now() - startedAt;
            const lastCheck = Date.parse(booking.booking_data?.lastPaymentCheckAt || 0);

            if (payment && payment.status === 'pending' && age > 60 * 1000 && Date.now() - lastCheck > 30 * 1000) {
                await booking.update({
                    booking_data: { ...(booking.booking_data || {}), lastPaymentCheckAt: new Date().toISOString() }
                });
                try {
                    await this.iciciPaymentService?.checkPaymentStatus(payment);
                } catch (error) {
                    console.error('Payment status check failed:', error.message);
                }
            }

            const fresh = (await this.findById(booking.id)) || booking;

            if (fresh.status === 'INITIATED' && age > 30 * 60 * 1000) {
                await fresh.update({ status: 'PAYMENT_NOT_COMPLETED' });
            }

            return fresh;
        } catch (error) {
            console.error('Payment status refresh failed:', error.message);
            return booking;
        }
    }

    /**
     * Re-check a paid TripJack flight that is still in progress.
     * Throttled to one TripJack call per 20 seconds per booking.
     */
    async refreshFlightStatus(booking) {
        try {
            // Booked, but the PNR / e-ticket number has not arrived yet:
            // the customer is looking, ask again (at most every 2 minutes)
            if (
                String(booking?.booking_type).toUpperCase() === 'FLIGHT' &&
                booking?.status === 'BOOKED' &&
                this.iciciPaymentService?.syncFlightTickets
            ) {
                const data = booking.booking_data || {};
                const sync = data.ticketSync || {};
                const last = Date.parse(sync.lastCheckAt || 0);
                if (!ticketState(data).complete && !sync.gaveUp && Date.now() - last >= 2 * 60 * 1000) {
                    await this.iciciPaymentService.syncFlightTickets(booking, { source: 'status-read', force: true });
                    return (await this.findById(booking.id)) || booking;
                }
                return booking;
            }

            const isPendingFlight =
                String(booking?.booking_type).toUpperCase() === 'FLIGHT' &&
                booking?.status === 'BOOKING_IN_PROGRESS' &&
                booking?.payment_status === 'SUCCESS';

            if (!isPendingFlight || !this.iciciPaymentService?.reconcileFlightBooking) {
                return booking;
            }

            const last = Date.parse(booking.booking_data?.lastStatusCheckAt || 0);
            if (Date.now() - last < 20 * 1000) {
                return booking;
            }

            await this.iciciPaymentService.reconcileFlightBooking(booking, { source: 'status-read' });
            return (await this.findById(booking.id)) || booking;
        } catch (error) {
            console.error('Flight status refresh failed:', error.message);
            return booking;
        }
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
        bookingType = null,
        trip = null
    ) {
        const { Op, literal } = require('sequelize');

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

        // Filter by trip state (My bookings tabs)
        const tripFilter = String(trip || '').trim().toUpperCase();
        if (tripFilter && tripFilter !== 'ALL') {
            if (!TRIP_FILTERS.includes(tripFilter)) {
                const error = new Error(`Invalid trip filter. Use ${TRIP_FILTERS.join(', ')}`);
                error.status = 400;
                throw error;
            }
            const today = indiaToday();
            if (tripFilter === 'UPCOMING') {
                where.status = 'BOOKED';
                where[Op.and] = [literal(`((${TRIP_END_SQL}) IS NULL OR LEFT(${TRIP_END_SQL}, 10) >= '${today}')`)];
            } else if (tripFilter === 'COMPLETED') {
                where.status = 'BOOKED';
                where[Op.and] = [literal(`LEFT(${TRIP_END_SQL}, 10) < '${today}'`)];
            } else if (tripFilter === 'PENDING') {
                where.status = { [Op.in]: PENDING_STATUSES };
            } else if (tripFilter === 'CANCELLED') {
                where.status = { [Op.in]: CLOSED_STATUSES };
            }
        }

        const { count, rows } = await Booking.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        const counters = userId ? await this.getTripSummary(userId, where.booking_type || null) : null;

        return {
            bookings: rows,
            pagination: {
                currentPage: page,
                limit,
                totalRecords: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            // dashboard counters over all of the customer's bookings
            summary: counters?.overall,
            // counts for the filter tabs (within the selected booking type)
            filterCounts: counters?.filters
        };
    }

    /**
     * Customer trip counters.
     * Confirmed trips are upcoming until the trip ends (hotel check-out /
     * last travel date) and completed after that.
     */
    async getTripSummary(userId, bookingType = null) {
        const { literal } = require('sequelize');
        const rows = await Booking.findAll({
            where: { user_id: userId },
            attributes: ['status', 'booking_type', [literal(TRIP_END_SQL), 'trip_end']],
            raw: true
        });

        const today = indiaToday();
        const isUpcoming = (row) => !row.trip_end || String(row.trip_end).slice(0, 10) >= today;
        const count = (list) => {
            const booked = list.filter((row) => row.status === 'BOOKED');
            const upcoming = booked.filter(isUpcoming).length;
            return {
                all: list.length,
                total: booked.length,
                upcoming,
                completed: booked.length - upcoming,
                pending: list.filter((row) => PENDING_STATUSES.includes(row.status)).length,
                cancelled: list.filter((row) => CLOSED_STATUSES.includes(row.status)).length
            };
        };

        const overall = count(rows);
        const filters = bookingType
            ? count(rows.filter((row) => String(row.booking_type).toUpperCase() === bookingType))
            : overall;

        return {
            overall: { total: overall.total, upcoming: overall.upcoming, completed: overall.completed },
            filters
        };
    }
}


module.exports = BookingService;