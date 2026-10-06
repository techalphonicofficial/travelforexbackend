const axios = require('axios');

const Payment = require('../models/Payment');
const paymentGatewayConfigService = require('./paymentGatewayConfig.service');
const { createSecureHash } = require('../utils/iciciHash');

class IciciPaymentService {
    constructor(tripJackFlightService = null, tripJackHotelService = null) {
        this.tripJackFlightService = tripJackFlightService;
        this.tripJackHotelService = tripJackHotelService;
    }


    /**
     * Inject TripJackFlightService
     * after container initialization if required.
     */
    setTripJackFlightService(tripJackFlightService) {
        this.tripJackFlightService =
            tripJackFlightService;
    }

    setTripJackHotelService(tripJackHotelService) {
        this.tripJackHotelService =
            tripJackHotelService;
    }

    /**
     * Generate ICICI transaction date.
     *
     * Format:
     * YYYYMMDDHHMMSS
     */
    generateTxnDate() {

        const now = new Date();

        const pad = (value) =>
            String(value).padStart(2, '0');

        return (
            now.getFullYear() +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds())
        );
    }


    /**
     * Get active ICICI gateway configuration.
     */
    async getGatewayConfig(environment = 'UAT') {

        return await paymentGatewayConfigService.getActiveGateway(
            'ICICI_ORANGE_PG',
            environment
        );
    }


    /**
     * Generate unique merchant transaction number.
     */
    generateMerchantTxnNo() {

        const timestamp = Date.now();

        const random = Math.floor(
            1000 + Math.random() * 9000
        );

        return `TXN${timestamp}${random}`;
    }


    /**
     * Build ICICI Initiate Sale URL.
     */
    buildInitiateSaleUrl(config) {

        if (!config.base_url) {
            throw new Error(
                'ICICI base URL is not configured'
            );
        }

        if (!config.initiate_sale_url) {
            throw new Error(
                'ICICI Initiate Sale URL is not configured'
            );
        }

        return `${config.base_url.replace(/\/+$/, '')}/${config.initiate_sale_url.replace(/^\/+/, '')}`;
    }


    /**
     * Create ICICI Initiate Sale request.
     */
    async initiateSale({
        userId,
        bookingId = null,
        bookingRefrence = null,
        customTripId = null,
        amount,
        environment = 'UAT',
        requestData = {},
        bookingType
    }) {

        if (!userId) {
            throw new Error(
                'userId is required'
            );
        }

        if (!amount) {
            throw new Error(
                'Payment amount is required'
            );
        }

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            throw new Error(
                'Invalid payment amount'
            );
        }


        /*
         * 1. Get gateway configuration.
         */
        const config =
            await this.getGatewayConfig(
                environment
            );


        /*
         * 2. Generate merchant transaction number.
         */
        const merchantTxnNo =
            this.generateMerchantTxnNo();


        /*
         * 3. Create internal Payment
         * before calling ICICI.
         */
        const payment =
            await Payment.create({

                custom_trip_id:
                    customTripId,

                booking_id:
                    bookingId,

                user_id:
                    userId,

                amount:
                    numericAmount,

                currency:
                    config.currency || 'INR',

                gateway:
                    'ICICI_ORANGE_PG',

                merchant_txn_no:
                    merchantTxnNo,

                status:
                    'pending'
            });


        try {

            /*
             * 4. Build ICICI request payload.
             */
            const payload = {

                merchantId:
                    config.merchant_id,

                aggregatorID:
                    config.aggregator_id,

                merchantTxnNo:
                    merchantTxnNo,

                amount:
                    numericAmount.toFixed(2),

                currencyCode:
                    '356',

                payType:
                    '0',

                customerEmailID:
                    requestData.customerEmailID ||
                    'test@travel-forex.com',

                transactionType:
                    'SALE',

                returnURL:
                    requestData.returnURL ||
                    `https://travel-forex.com/profile/${bookingRefrence}`,

                txnDate:
                    requestData.txnDate ||
                    this.generateTxnDate(),

                customerMobileNo:
                    requestData.customerMobileNo ||
                    '919999999999',

                customerName:
                    requestData.customerName ||
                    'Test User',

                addlParam1:
                    bookingId,

                addlParam2:
                    bookingType || 'FLIGHT',
            };


            /*
             * 5. Generate ICICI secure hash.
             */



            payload.secureHash =
                createSecureHash(
                    payload,
                    config.secure_key
                );


            /*
             * 6. Build API URL.
             */
            const initiateSaleUrl =
                this.buildInitiateSaleUrl(
                    config
                );


            /*
             * 7. Call ICICI Initiate Sale API.
             */

            const response =
                await axios.post(
                    initiateSaleUrl,
                    payload,
                    {
                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        timeout:
                            30000
                    }
                );


            /*
             * 8. Store gateway response.
             */
            const gatewayResponse =
                response.data || {};


            /*
             * 9. Save ICICI metadata.
             *
             * secureHash is not stored.
             */
            await payment.update({

                tran_ctx:
                    gatewayResponse.tranCtx ||
                    null,

                payment_data: {

                    request: {
                        ...payload,
                        secureHash:
                            undefined
                    },

                    initiate_sale_url:
                        initiateSaleUrl,

                    response:
                        gatewayResponse
                },

                gateway_response:
                    gatewayResponse
            });


            /*
             * 10. Return payment information.
             */
            return {

                success:
                    true,

                paymentId:
                    payment.id,

                merchantTxnNo:
                    merchantTxnNo,

                status:
                    payment.status,

                gateway:
                    'ICICI_ORANGE_PG',

                response:
                    gatewayResponse
            };

        } catch (error) {

            /*
             * ICICI Initiate Sale failed.
             */
            const errorResponse =
                error.response?.data ||
                null;


            await payment.update({

                status:
                    'failed',

                gateway_response:
                    errorResponse || {
                        message:
                            error.message
                    }
            });


            console.error(
                'ICICI Initiate Sale Error:',
                errorResponse ||
                error.message
            );


            throw new Error(
                errorResponse?.message ||
                error.message ||
                'Unable to initiate ICICI payment'
            );
        }
    }


    /**
     * Find payment using merchant transaction number.
     */
    async findPaymentByMerchantTxnNo(
        merchantTxnNo
    ) {

        if (!merchantTxnNo) {
            throw new Error(
                'merchantTxnNo is required'
            );
        }


        const payment =
            await Payment.findOne({

                where: {

                    merchant_txn_no:
                        merchantTxnNo
                }
            });


        if (!payment) {
            throw new Error(
                `Payment not found for merchantTxnNo: ${merchantTxnNo}`
            );
        }


        return payment;
    }


    // booking-details response se DB aur customer ke liye summary nikalo
    extractHotelBookingSummary(details) {
        const order = details?.order || details?.data?.order || {};
        const item = details?.itemInfos?.HOTEL || {};
        const hInfo = item.hInfo || {};
        const op = hInfo.ops?.[0] || {};
        const rooms = Array.isArray(op.ris) ? op.ris : [];
        const query = item.query || {};

        // inst[].msg JSON string hota hai, safely parse karo
        const parseMsg = (msg) => {
            try { return JSON.parse(msg); } catch { return msg || null; }
        };
        const instructions = {};
        (hInfo.inst || []).forEach((i) => {
            if (i?.type) instructions[i.type] = parseMsg(i.msg);
        });

        return {
            tripJackBookingId: order.bookingId || null,
            status: String(order.status || '').toUpperCase(),
            // order level amount use karo (room level me 1 paisa rounding fark hota hai)
            amount: Number(order.amount ?? op.tp ?? 0),
            currency: op.sc || 'INR',
            createdOn: order.createdOn || null,
            hotelConfirmationNumber: details?.hotelConfirmationNumber || null,
            hotel: {
                name: hInfo.name || null,
                rating: hInfo.rt ?? null,
                address: hInfo.ad?.adr || null,
                address2: hInfo.ad?.adr2 || null,
                city: hInfo.ad?.city?.name || null,
                postalCode: hInfo.ad?.postalCode || null,
                lat: hInfo.gl?.lt || null,
                lng: hInfo.gl?.ln || null,
                checkInFrom: hInfo.checkInTime?.beginTime || null,
                checkOutFrom: hInfo.checkOutTime?.beginTime || null, // checkInTime.endTime unreliable, save nahi kar rahe
                minCheckInAge: hInfo.checkInTime?.minAge ?? null
            },
            stay: {
                checkIn: query.checkinDate || rooms[0]?.checkInDate || null,
                checkOut: query.checkoutDate || rooms[0]?.checkOutDate || null
            },
            rooms: rooms.map((r) => ({
                name: r.srn || r.rc || r.rt || null,
                mealBasis: r.mb || null,
                adults: r.adt ?? null,
                children: r.chd ?? null,
                guests: (r.ti || []).map((t) => ({
                    title: t.ti, type: t.pt, firstName: t.fN, lastName: t.lN
                }))
            })),
            cancellation: {
                refundable: op.cnp?.ifra === true,
                nonRefundable: op.cnp?.inra === true,
                penalties: op.cnp?.pd || []
            },
            // customer ko booking se pehle/baad dikhane wali policies (fees, local guest rule, ID rule)
            instructions
        };
    }

    // Booking confirm hone par customer ko notify karo (sirf ek baar)
    async notifyHotelBookingConfirmed(existingBooking, summary) {
        const tj = existingBooking.booking_data?.tripjack || {};
        if (tj.confirmationSentAt) return;

        // TODO: apni email/SMS service ka method yahan lagao
        const sender =
            this.sendHotelBookingConfirmation ||
            this.notificationService?.sendHotelBookingConfirmation;

        if (typeof sender !== 'function') {
            console.warn('Hotel confirmation sender not configured, skipping notification');
            return;
        }

        await sender.call(this.notificationService || this, existingBooking, summary);

        const latest = existingBooking.booking_data || {};
        await existingBooking.update({
            booking_data: {
                ...latest,
                tripjack: {
                    ...(latest.tripjack || {}),
                    confirmationSentAt: new Date().toISOString()
                }
            }
        });
    }

    // Cron / manual: BOOKING_IN_PROGRESS rows reconcile karo + hotelConfirmationNumber refetch
    async reconcileHotelBooking(existingBooking) {
        const bookingData = existingBooking.booking_data || {};
        const tj = bookingData.tripjack || bookingData.tripJack || {};
        const tripJackBookingId =
            existingBooking.provider_booking_id || tj.review?.bookingId;

        if (!tripJackBookingId) throw new Error('TripJack bookingId missing for reconcile');

        const details = await this.tripJackHotelService.getBookingDetails({
            bookingId: tripJackBookingId
        });
        const summary = this.extractHotelBookingSummary(details);
        const status = summary.status;

        const MAP = {
            SUCCESS: 'BOOKED', ON_HOLD: 'ON_HOLD',
            FAILED: 'BOOKING_FAILED', ABORTED: 'BOOKING_FAILED', CANCELLED: 'CANCELLED'
        };
        const internalStatus = MAP[status] || existingBooking.status;

        await existingBooking.update({
            status: internalStatus,
            booking_data: {
                ...bookingData,
                tripjack: {
                    ...tj,
                    bookingDetails: details,
                    summary,
                    bookingStatus: status || 'UNKNOWN',
                    hotelConfirmationNumber:
                        summary.hotelConfirmationNumber || tj.hotelConfirmationNumber || null,
                    bookedAt: status === 'SUCCESS' ? (tj.bookedAt || new Date().toISOString()) : tj.bookedAt || null,
                    refundRequired: internalStatus === 'BOOKING_FAILED'
                }
            }
        });

        if (status === 'SUCCESS') {
            await this.notifyHotelBookingConfirmed(existingBooking, summary).catch((e) =>
                console.error('Hotel confirmation notify failed:', e.message)
            );
        }
        return { status, internalStatus, summary };
    }


    async handleHotelBookingAfterPayment(
        payment,
        callbackData,
        bookingService,
        existingBooking,
        options = {}
    ) {

        const { Op } = require('sequelize'); // ESM ho to file ke top par: import { Op } from 'sequelize'

        const POLL_INTERVAL_MS = options.pollIntervalMs ?? 5000;
        const POLL_TIMEOUT_MS = options.pollTimeoutMs ?? 180000;

        const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Master'];
        const TERMINAL = ['SUCCESS', 'ON_HOLD', 'FAILED', 'ABORTED', 'CANCELLED'];
        const STATUS_MAP = {
            SUCCESS: 'BOOKED',
            ON_HOLD: 'ON_HOLD',
            FAILED: 'BOOKING_FAILED',
            ABORTED: 'BOOKING_FAILED',
            CANCELLED: 'CANCELLED'
        };
        const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const isAdult = (guest) => String(guest.type || '').toUpperCase() === 'ADULT';

        const normalizeTitle = (value) => {
            const raw = String(value || '').replace(/\./g, '').trim().toLowerCase();
            return TITLES.find((t) => t.toLowerCase() === raw) || null;
        };

        const cleanName = (value) =>
            String(value || '')
                .replace(/[^A-Za-z\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

        // TripJack booking-details call (service me jo naam ho wahi use hoga)
        const fetchBookingDetails = async (bookingId) => {
            const svc = this.tripJackHotelService;
            const fn =
                await svc.getBookingDetails;
            if (typeof fn !== 'function') {
                throw new Error(
                    'TripJackHotelService me booking-details method nahi mila (getBookingDetails). Service me banao: POST /oms/v3/hotel/booking-details { bookingId }'
                );
            }
            return fn.call(svc, { bookingId });
        };

        const readStatus = (details) =>
            String(
                details?.order?.status ||
                details?.data?.order?.status ||
                ''
            ).toUpperCase();

        // Terminal status aane tak poll karo (max 180 sec)
        const pollBookingDetails = async (bookingId) => {
            const startedAt = Date.now();
            let details = null;
            let status = '';

            while (true) {
                try {
                    details = await fetchBookingDetails(bookingId);
                    status = readStatus(details);

                    if (TERMINAL.includes(status)) {
                        return { status, details, timedOut: false };
                    }
                } catch (pollError) {
                    console.error(`TripJack booking-details poll failed [${bookingId}]:`, pollError.message);
                }

                if (Date.now() - startedAt + POLL_INTERVAL_MS > POLL_TIMEOUT_MS) break;
                await sleep(POLL_INTERVAL_MS);
            }

            return { status, details, timedOut: true };
        };

        // booking_data.tripjack me merge karke save
        const persist = async (internalStatus, tjPatch = {}, extraFields = {}) => {
            const latest = existingBooking.booking_data || {};
            const latestTj = latest.tripjack || latest.tripJack || {};

            await existingBooking.update({
                status: internalStatus,
                payment_status: 'SUCCESS',
                ...extraFields,
                booking_data: {
                    ...latest,
                    tripjack: { ...latestTj, ...tjPatch }
                }
            });
        };

        let tripJackBookingId = null;
        let bookSubmitted = false;

        try {
            // 1. Basic validation
            if (!this.tripJackHotelService) {
                throw new Error('TripJackHotelService is not configured in IciciPaymentService');
            }
            if (!existingBooking) {
                throw new Error('Existing booking not found');
            }

            const bookingData = existingBooking.booking_data || {};
            const tripjack = bookingData.tripjack || bookingData.tripJack || {};
            const review = tripjack.review || {};
            const option = review.option; // Review response hi final reference hai

            tripJackBookingId = review.bookingId;

            if (!tripJackBookingId) throw new Error('TripJack review bookingId is missing');
            if (!option) throw new Error('TripJack review option is missing');

            // 2. Duplicate callback guard (status par nahi, submit marker par)
            const alreadySubmitted = Boolean(tripjack.bookAttemptedAt || tripjack.book);

            if (['BOOKED', 'ON_HOLD'].includes(existingBooking.status) || alreadySubmitted) {
                console.warn(`Hotel booking already submitted/${existingBooking.status}, skipping duplicate callback`, {
                    internalBookingId: existingBooking.id,
                    tripJackBookingId,
                    bookAttemptedAt: tripjack.bookAttemptedAt || null
                });
                return {
                    success: true,
                    alreadyProcessed: true,
                    bookingStatus: existingBooking.status,
                    booking: existingBooking
                };
            }

            // 3. Guests
            const guests = Array.isArray(bookingData.guests) ? bookingData.guests : [];
            if (!guests.length) throw new Error('Hotel guest details are missing');

            const primaryGuest =
                bookingData.primaryGuest ||
                guests.find((guest) => guest.isPrimary) ||
                guests.find(isAdult);

            if (!primaryGuest) throw new Error('Primary guest details are missing');

            // 4. Amount (Review ke totalPrice se exact)
            const tripJackAmount = Math.round((Number(option?.pricing?.totalPrice) + Number.EPSILON) * 100) / 100;
            if (!Number.isFinite(tripJackAmount) || tripJackAmount <= 0) {
                throw new Error('TripJack review totalPrice is missing or invalid');
            }

            const panRequired = option?.compliance?.panRequired === true;
            const passportRequired = option?.compliance?.passportRequired === true;

            // 5. Rooms
            const roomIndexes = [
                ...new Set(guests.map((guest) => Number(guest.roomIndex ?? 0)))
            ].sort((a, b) => a - b);

            roomIndexes.forEach((roomIndex, position) => {
                if (roomIndex !== position) {
                    throw new Error(`Guest roomIndex values must be continuous from 0. Found: ${roomIndexes.join(', ')}`);
                }
            });

            const reviewRooms = Array.isArray(option.roomInfo) ? option.roomInfo : [];
            if (reviewRooms.length && reviewRooms.length !== roomIndexes.length) {
                throw new Error(
                    `Room count mismatch: review has ${reviewRooms.length} room(s), guests are in ${roomIndexes.length} room(s)`
                );
            }

            const roomTravellerInfo = roomIndexes.map((roomIndex) => {
                const roomGuests = guests
                    .filter((guest) => Number(guest.roomIndex ?? 0) === roomIndex)
                    .sort((a, b) => (isAdult(a) ? 0 : 1) - (isAdult(b) ? 0 : 1)); // adult pehle

                const info = reviewRooms[roomIndex];
                if (info && Number.isFinite(Number(info.adults))) {
                    const adults = roomGuests.filter(isAdult).length;
                    const children = roomGuests.length - adults;
                    if (adults !== Number(info.adults) || children !== Number(info.children ?? 0)) {
                        throw new Error(
                            `Room ${roomIndex + 1} traveller mismatch: review expects ${info.adults} adult(s) + ${info.children ?? 0} child(ren), got ${adults} + ${children}`
                        );
                    }
                }

                const travellerInfo = roomGuests.map((guest, i) => {
                    const label = `Room ${roomIndex + 1}, traveller ${i + 1}`;

                    const ti = normalizeTitle(guest.title);
                    if (!ti) throw new Error(`${label}: invalid title "${guest.title}" (allowed: ${TITLES.join(', ')})`);

                    const pt = String(guest.type || '').toUpperCase();
                    if (!['ADULT', 'CHILD'].includes(pt)) throw new Error(`${label}: invalid type "${guest.type}"`);

                    const fN = cleanName(guest.firstName);
                    const lN = cleanName(guest.lastName);
                    if (!fN || !lN) throw new Error(`${label}: first name or last name is blank`);

                    const traveller = { ti, pt, fN, lN };

                    const pan = String(guest.pan || '').trim().toUpperCase();
                    if (panRequired && !PAN_REGEX.test(pan)) {
                        throw new Error(`${label}: valid PAN is required for this option (got "${pan}")`);
                    }
                    if (pan && PAN_REGEX.test(pan)) traveller.pan = pan;

                    const pNum = String(guest.passportNumber || '').trim();
                    if (passportRequired && !pNum) {
                        throw new Error(`${label}: passport number is required for this option`);
                    }
                    if (pNum) traveller.pNum = pNum;

                    return traveller;
                });

                if (!travellerInfo.length) throw new Error(`Room ${roomIndex + 1} has no travellers`);

                return { travellerInfo };
            });

            // Lead pax ka naam rooms ke beech unique hona chahiye
            if (roomTravellerInfo.length > 1) {
                const leadNames = roomTravellerInfo.map((room) =>
                    `${room.travellerInfo[0].fN} ${room.travellerInfo[0].lN}`.toLowerCase()
                );
                if (new Set(leadNames).size !== leadNames.length) {
                    throw new Error(`Lead guest name must be unique across rooms. Found: ${leadNames.join(' | ')}`);
                }
            }

            // 6. Delivery info
            const email = String(primaryGuest.email || '').trim();
            if (!EMAIL_REGEX.test(email)) {
                throw new Error(`Primary guest email is missing or invalid: "${email}"`);
            }

            const countryDigits =
                String(bookingData.countryCode || primaryGuest.countryCode || '+91').replace(/\D/g, '') || '91';

            let mobile = String(primaryGuest.mobile || '').replace(/\D/g, '');
            if (countryDigits === '91') {
                if (mobile.length === 12 && mobile.startsWith('91')) mobile = mobile.slice(2);
                else if (mobile.length === 11 && mobile.startsWith('0')) mobile = mobile.slice(1);

                if (!/^\d{10}$/.test(mobile)) {
                    throw new Error(`Invalid Indian mobile number: "${mobile}" (${mobile.length} digits, expected 10)`);
                }
            } else if (mobile.length < 6 || mobile.length > 15) {
                throw new Error(`Invalid mobile number: "${mobile}"`);
            }

            // 7. Final TripJack payload (sirf documented fields)
            const tripJackBookPayload = {
                bookingId: tripJackBookingId,
                type: 'HOTEL',
                roomTravellerInfo,
                deliveryInfo: {
                    emails: [email],
                    contacts: [mobile],
                    code: [`+${countryDigits}`]
                },
                paymentInfos: [{ amount: tripJackAmount }]
            };

            if (bookingData.gstInfo?.gstNumber && bookingData.gstInfo?.registeredName) {
                tripJackBookPayload.gstInfo = {
                    gstNumber: bookingData.gstInfo.gstNumber,
                    registeredName: bookingData.gstInfo.registeredName
                };
            }

            // 8. Atomic claim: sirf wahi process aage badhega jisne row ko abhi tak badla hua nahi dekha
            const [claimed] = await existingBooking.constructor.update(
                {
                    payment_status: 'SUCCESS',
                    status: 'BOOKING_IN_PROGRESS',
                    provider_booking_id: String(tripJackBookingId),
                    provider_reference: String(tripJackBookingId),
                    booking_data: {
                        ...bookingData,
                        tripjack: {
                            ...tripjack,
                            bookAttemptedAt: new Date().toISOString()
                        }
                    }
                },
                {
                    where: {
                        id: existingBooking.id,
                        updated_at: existingBooking.updated_at
                    }
                }
            );

            if (!claimed) {
                console.warn('Hotel booking already claimed by another process, skipping');
                await existingBooking.reload();
                return {
                    success: true,
                    alreadyProcessed: true,
                    bookingStatus: existingBooking.status,
                    booking: existingBooking
                };
            }
            await existingBooking.reload();

            // 9. TripJack Book (sirf ek baar)
            bookSubmitted = true;
            const bookResponse = await this.tripJackHotelService.book(tripJackBookPayload);

            if (bookResponse?.status?.success === false) {
                const err = bookResponse?.errors?.[0] || bookResponse?.error || {};
                throw new Error(
                    `TripJack book rejected: [${err.errCode || err.code || 'NA'}] ${err.message || 'Unknown error'}`
                );
            }

            // 10. Booking-details poll (5 sec interval, max 180 sec)
            const { status, details, timedOut } = await pollBookingDetails(tripJackBookingId);

            const internalStatus = STATUS_MAP[status] || 'BOOKING_IN_PROGRESS';
            const isFailed = internalStatus === 'BOOKING_FAILED';

            // 11. Save result
            const summary = details ? this.extractHotelBookingSummary(details) : null;

            await persist(
                internalStatus,
                {
                    bookPayload: tripJackBookPayload,
                    book: bookResponse,
                    bookingDetails: details,
                    summary,
                    bookingStatus: status || 'UNKNOWN',
                    hotelConfirmationNumber: summary?.hotelConfirmationNumber || null,
                    bookedAt: status === 'SUCCESS' ? new Date().toISOString() : null,
                    pollTimedOut: timedOut,
                    refundRequired: isFailed
                },
                {
                    provider_booking_id: String(tripJackBookingId),
                    provider_reference: String(tripJackBookingId)
                }
            );

            // Customer ko confirmation sirf SUCCESS par
            if (status === 'SUCCESS') {
                try {
                    await this.notifyHotelBookingConfirmed(existingBooking, summary);
                } catch (notifyError) {
                    console.error('Hotel confirmation notify failed:', notifyError.message);
                }
            }

            return {
                success: !isFailed,
                bookingStatus: internalStatus,
                tripJackStatus: status,
                pollTimedOut: timedOut,
                refundRequired: isFailed,
                booking: existingBooking,
                tripJack: { book: bookResponse, bookingDetails: details }
            };
        } catch (error) {
            console.error('TripJack Hotel Booking Failed:', {
                paymentId: payment?.id,
                internalBookingId: existingBooking?.id,
                merchantTxnNo: payment?.merchant_txn_no,
                tripJackBookingId,
                error: error.message,
                stack: error.stack
            });

            if (/duplicate booking/i.test(String(error.message || ''))) {
                try {
                    await persist('BOOKING_FAILED', {
                        error: { message: error.message, failedAt: new Date().toISOString() },
                        duplicateBooking: true,
                        refundRequired: true
                    });
                } catch (saveError) {
                    console.error('Failed to save duplicate booking state:', saveError.message);
                }
                throw error;
            }

            // Book TripJack tak pahunch gayi ho (timeout etc.) to pehle status reconcile karo
            if (bookSubmitted && tripJackBookingId) {
                try {
                    const details = await fetchBookingDetails(tripJackBookingId);
                    const status = readStatus(details);

                    console.log('TripJack reconcile status after error:', status);

                    if (status && !['FAILED', 'ABORTED'].includes(status)) {
                        const internalStatus = STATUS_MAP[status] || 'BOOKING_IN_PROGRESS';

                        await persist(internalStatus, {
                            bookingDetails: details,
                            bookingStatus: status,
                            hotelConfirmationNumber: details?.hotelConfirmationNumber || null,
                            reconciledAfterError: error.message
                        });

                        return {
                            success: true,
                            reconciled: true,
                            bookingStatus: internalStatus,
                            tripJackStatus: status,
                            booking: existingBooking
                        };
                    }
                } catch (reconcileError) {
                    console.error('TripJack reconcile failed:', reconcileError.message);
                }
            }

            // Payment ho chuka hai, booking fail hui hai, to refund chahiye
            try {
                await persist('BOOKING_FAILED', {
                    error: {
                        message: error.message,
                        failedAt: new Date().toISOString()
                    },
                    refundRequired: true
                });
            } catch (saveError) {
                console.error('Failed to save booking failure state:', saveError.message);
            }

            throw error;
        }
    }

    /**
     * Wait helper.
     *
     * TripJack Booking Details should be
     * requested after booking processing has
     * had some time to complete.
     */
    async wait(milliseconds) {

        return new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }


    /**
     * Verify ICICI payment advice / callback.
     *
     * FLOW:
     *
     * ICICI Callback
     *      ↓
     * Find Payment
     *      ↓
     * Validate Merchant
     *      ↓
     * Validate Aggregator
     *      ↓
     * Validate Amount
     *      ↓
     * Validate tranCtx
     *      ↓
     * Validate Secure Hash
     *      ↓
     * Payment SUCCESS
     *      ↓
     * Get Booking from Container
     *      ↓
     * TripJack Fare Validate
     *      ↓
     * TripJack Book
     *      ↓
     * Wait
     *      ↓
     * Booking Details
     *      ↓
     * Internal Booking BOOKED
     */


    async handlePaymentAdvice(callbackData) {


        console.log('ICICI Payment Callback Received:', callbackData);
        if (!callbackData || typeof callbackData !== 'object') {
            throw new Error('Invalid payment callback data');
        }

        // 1. Merchant transaction number
        const merchantTxnNo =
            callbackData.merchantTxnNo ||
            callbackData.merchantTransactionNo;

        if (!merchantTxnNo) {
            throw new Error('merchantTxnNo is missing from payment callback');
        }

        // 2. Find payment
        const payment = await this.findPaymentByMerchantTxnNo(merchantTxnNo);

        if (!payment) {
            throw new Error(`Payment not found: ${merchantTxnNo}`);
        }

        // 3. Gateway configuration
        const environment = callbackData.environment || 'UAT';
        const config = await this.getGatewayConfig(environment);

        // 4. Validate merchant ID
        if (
            callbackData.merchantId &&
            String(callbackData.merchantId) !== String(config.merchant_id)
        ) {
            throw new Error('Invalid merchantId in payment callback');
        }

        // 5. Validate aggregator ID
        if (
            callbackData.aggregatorID &&
            String(callbackData.aggregatorID) !== String(config.aggregator_id)
        ) {
            throw new Error('Invalid aggregatorID in payment callback');
        }

        // 6. Validate amount
        if (callbackData.amount !== undefined) {
            const callbackAmount = Number(callbackData.amount);
            const paymentAmount = Number(payment.amount);

            if (
                !Number.isFinite(callbackAmount) ||
                !Number.isFinite(paymentAmount) ||
                Math.round(callbackAmount * 100) !==
                Math.round(paymentAmount * 100)
            ) {
                throw new Error('Payment amount mismatch');
            }
        }

        // 7. Validate transaction context
        if (
            callbackData.tranCtx &&
            payment.tran_ctx &&
            String(callbackData.tranCtx) !== String(payment.tran_ctx)
        ) {
            throw new Error('Invalid tranCtx in payment callback');
        }

        // 8. Validate secure hash
        const receivedSecureHash = callbackData.secureHash;

        if (!receivedSecureHash) {
            throw new Error('secureHash is missing from payment callback');
        }

        const dataForHash = { ...callbackData };
        delete dataForHash.secureHash;

        const calculatedSecureHash = createSecureHash(
            dataForHash,
            config.secure_key
        );

        if (
            String(receivedSecureHash).toLowerCase() !==
            String(calculatedSecureHash).toLowerCase()
        ) {
            throw new Error('Invalid secureHash in payment callback');
        }

        // 9. Determine payment status
        const responseCode = String(callbackData.responseCode || '')
            .trim()
            .toUpperCase();

        const transactionStatus = String(
            callbackData.status ||
            callbackData.transactionStatus ||
            ''
        )
            .trim()
            .toLowerCase();

        const isSuccess =
            responseCode === '0000' ||
            responseCode === '000' ||
            transactionStatus === 'success' ||
            transactionStatus === 'successful';

        // 10. Payment failed
        if (!isSuccess) {
            await payment.update({
                status: 'failed',
                transaction_id:
                    callbackData.txnID ||
                    callbackData.transactionId ||
                    callbackData.txnId ||
                    payment.transaction_id ||
                    null,
                tran_ctx:
                    callbackData.tranCtx ||
                    payment.tran_ctx ||
                    null,
                gateway_response: callbackData
            });

            return {
                success: true,
                alreadyProcessed: false,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: 'failed'
            };
        }

        // 11. Determine booking type
        const bookingType = String(callbackData.addlParam2 || '')
            .trim()
            .toUpperCase();

        if (!['FLIGHT', 'HOTEL'].includes(bookingType)) {
            throw new Error(
                `Unsupported booking type: ${callbackData.addlParam2}`
            );
        }

        // 12. Idempotency check
        if (payment.status === 'success') {
            return {
                success: true,
                alreadyProcessed: true,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: payment.status
            };
        }

        // 13. Mark payment successful
        await payment.update({
            status: 'success',
            transaction_id:
                callbackData.txnID ||
                callbackData.transactionId ||
                callbackData.txnId ||
                payment.transaction_id ||
                null,
            tran_ctx:
                callbackData.tranCtx ||
                payment.tran_ctx ||
                null,
            gateway_response: callbackData,
            paid_at: new Date()
        });

        // 14. Load BookingService
        let bookingService;

        try {
            const container = require('../container');
            bookingService = container?.services?.bookingService;
        } catch (error) {
            throw new Error(
                `Unable to load BookingService: ${error.message}`
            );
        }

        if (!bookingService) {
            throw new Error(
                'BookingService is not available in container.services'
            );
        }

        // 15. Find internal booking
        const existingBooking = await bookingService.findById(
            payment.booking_id
        );

        if (!existingBooking) {
            throw new Error(
                `Booking not found: ${payment.booking_id}`
            );
        }

        // 16. Booking failure handler
        const markBookingFailed = async (error) => {
            console.error('Booking failed after successful payment:', {
                bookingType,
                paymentId: payment.id,
                bookingId: payment.booking_id,
                error: error.message
            });

            try {
                const failedBooking = await bookingService.findById(
                    payment.booking_id
                );

                if (failedBooking) {
                    await failedBooking.update({
                        payment_status: 'SUCCESS',
                        status: 'BOOKING_FAILED',
                        booking_data: {
                            ...(failedBooking.booking_data || {}),
                            bookingError: {
                                type: bookingType,
                                message: error.message,
                                failedAt: new Date().toISOString()
                            }
                        }
                    });
                }
            } catch (updateError) {
                console.error(
                    'Unable to update failed booking:',
                    updateError.message
                );
            }

            return {
                success: true,
                alreadyProcessed: false,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: 'success',
                bookingStatus: 'BOOKING_FAILED',
                bookingType,
                bookingError: error.message
            };
        };

        // =========================================================
        // 17. HOTEL BOOKING
        // =========================================================
        if (bookingType === 'HOTEL') {

            try {
                await existingBooking.update({
                    payment_status: 'SUCCESS',
                    status: 'BOOKING_IN_PROGRESS'
                });

                // Call hotel booking function
                const hotelResponse =
                    await this.handleHotelBookingAfterPayment(
                        payment,
                        callbackData,
                        bookingService,
                        existingBooking
                    );

                return {
                    success: true,
                    alreadyProcessed: false,
                    paymentId: payment.id,
                    merchantTxnNo: payment.merchant_txn_no,
                    status: 'success',
                    bookingStatus: hotelResponse.bookingStatus,
                    bookingType: 'HOTEL',
                    booking: existingBooking,
                    hotel: hotelResponse
                };

            } catch (hotelError) {
                console.error(
                    'Hotel post-payment booking error:',
                    hotelError
                );

                return await markBookingFailed(hotelError);
            }
        }

        // =========================================================
        // 18. FLIGHT BOOKING - TRIPJACK
        // =========================================================

        if (bookingType === 'FLIGHT') {

            try {

                if (!this.tripJackFlightService) {
                    throw new Error(
                        'TripJackFlightService is not configured'
                    );
                }

                // 19. Read booking data
                const bookingData =
                    existingBooking.booking_data || {};

                // =====================================================
                // IMPORTANT:
                // Use EXACT SAME payload which was already sent
                // during Fare Validate at booking creation time.
                // Do NOT rebuild the payload.
                // Do NOT call Fare Validate again.
                // =====================================================

                const fareValidateData =
                    bookingData.fareValidate || {};

                const tripJackBookPayload =
                    fareValidateData.request;

                if (
                    !tripJackBookPayload ||
                    typeof tripJackBookPayload !== 'object'
                ) {
                    throw new Error(
                        'TripJack Fare Validate request payload is missing'
                    );
                }

                if (!tripJackBookPayload.bookingId) {
                    throw new Error(
                        'TripJack bookingId is missing from Fare Validate request'
                    );
                }

                // =====================================================
                // 20. Mark booking in progress
                // Payment has already been successfully received
                // =====================================================

                await existingBooking.update({
                    payment_status: 'SUCCESS',
                    status: 'BOOKING_IN_PROGRESS'
                });

                // =====================================================
                // 21. DIRECT TRIPJACK BOOK
                // NO FARE VALIDATE HERE
                // =====================================================

                const bookResponse =
                    await this.tripJackFlightService.book(
                        tripJackBookPayload
                    );

                const bookBody =
                    bookResponse?.data ?? bookResponse;

                if (
                    bookBody?.status?.success === false ||
                    bookBody?.status?.httpStatus >= 400
                ) {
                    throw new Error(
                        bookBody?.errors?.[0]?.message ||
                        'TripJack booking failed'
                    );
                }

                // =====================================================
                // 22. Extract booking ID and reference
                // =====================================================

                const providerBookingId =
                    bookBody?.bookingId ||
                    bookBody?.order?.bookingId ||
                    tripJackBookPayload.bookingId;

                const providerReference =
                    bookBody?.pnr ||
                    bookBody?.order?.pnr ||
                    bookBody?.providerReference ||
                    null;

                // =====================================================
                // 23. Wait before fetching booking details
                // =====================================================

                await this.wait(5000);

                // =====================================================
                // 24. Booking Details
                // =====================================================

                let bookingDetailsResponse = null;

                try {

                    bookingDetailsResponse =
                        await this.tripJackFlightService.bookingDetails({
                            bookingId: providerBookingId
                        });

                } catch (detailsError) {

                    console.error(
                        'TripJack Booking Details failed:',
                        detailsError.message
                    );

                }

                // =====================================================
                // 25. Verify final booking status
                // =====================================================

                const detailsBody =
                    bookingDetailsResponse?.data ??
                    bookingDetailsResponse;

                const detailsStatus = String(
                    detailsBody?.order?.status || ''
                ).toUpperCase();

                if (detailsStatus === 'FAILED') {

                    throw new Error(
                        'TripJack booking details returned FAILED status'
                    );

                }

                if (
                    detailsStatus &&
                    detailsStatus !== 'SUCCESS' &&
                    detailsStatus !== 'BOOKED'
                ) {

                    await existingBooking.update({

                        payment_status: 'SUCCESS',

                        status: 'BOOKING_IN_PROGRESS',

                        provider_booking_id:
                            String(providerBookingId),

                        booking_data: {

                            ...bookingData,

                            tripJack: {

                                // Keep the already saved Fare Validate response
                                fareValidate:
                                    fareValidateData.response || null,

                                book: bookResponse,

                                bookingDetails:
                                    bookingDetailsResponse

                            }

                        }

                    });

                    return {

                        success: true,

                        alreadyProcessed: false,

                        paymentId: payment.id,

                        merchantTxnNo:
                            payment.merchant_txn_no,

                        status: 'success',

                        bookingStatus: 'BOOKING_IN_PROGRESS',

                        bookingType: 'FLIGHT',

                        booking: existingBooking

                    };

                }

                // =====================================================
                // 26. Save final booking state
                // =====================================================

                await existingBooking.update({

                    provider_booking_id:
                        providerBookingId
                            ? String(providerBookingId)
                            : existingBooking.provider_booking_id,

                    provider_reference:
                        providerReference
                            ? String(providerReference)
                            : existingBooking.provider_reference,

                    status: 'BOOKED',

                    payment_status: 'SUCCESS',

                    booking_data: {

                        ...bookingData,

                        tripJack: {

                            // Keep the already saved Fare Validate response
                            fareValidate:
                                fareValidateData.response || null,

                            book: bookResponse,

                            bookingDetails:
                                bookingDetailsResponse

                        }

                    }

                });

                return {

                    success: true,

                    alreadyProcessed: false,

                    paymentId: payment.id,

                    merchantTxnNo:
                        payment.merchant_txn_no,

                    status: 'success',

                    bookingStatus: 'BOOKED',

                    bookingType: 'FLIGHT',

                    booking: existingBooking,

                    tripJack: {

                        // Return already completed Fare Validate response
                        fareValidate:
                            fareValidateData.response || null,

                        book: bookResponse,

                        bookingDetails:
                            bookingDetailsResponse

                    }

                };

            } catch (flightError) {

                return await markBookingFailed(
                    flightError
                );

            }

        }
    }
}


module.exports =
    IciciPaymentService;