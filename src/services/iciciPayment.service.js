const axios = require('axios');

const Payment = require('../models/Payment');
const paymentGatewayConfigService = require('./paymentGatewayConfig.service');
const { createSecureHash } = require('../utils/iciciHash');
const { mapTravellers, ticketState, ticketCheckDue, ticketSyncExpired } = require('../utils/flightTickets');

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

                    // one PAN per booking: the lead guest (first adult of room 1)
                    const pan = String(guest.pan || '').trim().toUpperCase();
                    const isLead = guest.isPrimary === true || (roomIndex === roomIndexes[0] && i === 0 && !guests.some((g) => g.isPrimary));
                    if (panRequired && isLead && !PAN_REGEX.test(pan)) {
                        throw new Error(`${label}: valid PAN of the lead guest is required for this option (got "${pan}")`);
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
    // =========================================================
    // TRIPJACK FLIGHT: CONFIRMATION AFTER BOOK
    //
    // The air/book response only means "request accepted".
    // A flight is confirmed only when booking-details says
    // order.status = SUCCESS and every traveller has a PNR.
    // =========================================================

    /**
     * Read TripJack booking-details and update our booking.
     * Returns { status, orderStatus, pnr }.
     */
    async reconcileFlightBooking(bookingOrId, { source = 'poll' } = {}) {
        const Booking = require('../models/Booking');

        const booking =
            typeof bookingOrId === 'object' && bookingOrId?.update
                ? await Booking.findByPk(bookingOrId.id)
                : await Booking.findByPk(bookingOrId);

        if (!booking) {
            return { status: null, orderStatus: null, pnr: null };
        }

        const bookingData = booking.booking_data || {};

        // Never touch a booking that is already final
        if (['BOOKED', 'CANCELLED', 'BOOKING_FAILED'].includes(booking.status)) {
            return { status: booking.status, orderStatus: null, pnr: bookingData.pnr || null };
        }

        const tripJackBookingId =
            booking.provider_booking_id ||
            bookingData?.fareValidate?.request?.bookingId ||
            null;

        if (!tripJackBookingId || !this.tripJackFlightService) {
            return { status: booking.status, orderStatus: null, pnr: null };
        }

        let body = null;
        let checkError = null;

        try {
            const response = await this.tripJackFlightService.bookingDetails({
                bookingId: tripJackBookingId,
                requirePaxPricing: true
            });
            body = response?.data ?? response;
            if (body?.status?.success === false) {
                checkError = body?.errors?.[0]?.message || 'Booking details not available';
            }
        } catch (error) {
            checkError = error.message;
        }

        const orderStatus = String(body?.order?.status || '').toUpperCase() || null;
        const travellers = Array.isArray(body?.itemInfos?.AIR?.travellerInfos)
            ? body.itemInfos.AIR.travellerInfos
            : [];

        // PNR per sector, e.g. { "DEL-BOM": "ABC123" }, and ticket numbers on each passenger
        const { passengers, pnrDetails, pnrs } = mapTravellers(bookingData, travellers);
        const everyoneHasPnr =
            travellers.length > 0 &&
            travellers.every((traveller) => Object.values(traveller?.pnrDetails || {}).some(Boolean));

        let status = 'BOOKING_IN_PROGRESS';
        if (orderStatus === 'SUCCESS' && everyoneHasPnr) status = 'BOOKED';
        else if (['FAILED', 'ABORTED'].includes(orderStatus)) status = 'BOOKING_FAILED';
        else if (orderStatus === 'CANCELLED') status = 'CANCELLED';

        const checks = Array.isArray(bookingData.statusChecks) ? bookingData.statusChecks.slice(-19) : [];
        checks.push({
            at: new Date().toISOString(),
            source,
            orderStatus,
            pnrs,
            error: checkError
        });

        const firstCheck = checks[0]?.at ? Date.parse(checks[0].at) : Date.now();
        const unresolvedFor = Date.now() - firstCheck;

        // The supplier still has no order 15 minutes after we started checking:
        // the book call never created one, so nothing was booked (refund due).
        const noOrder = /no order found/i.test(String(checkError || ''));
        if (status === 'BOOKING_IN_PROGRESS' && noOrder && unresolvedFor > 15 * 60 * 1000) {
            status = 'BOOKING_FAILED';
        }

        await booking.update({
            status,
            payment_status: 'SUCCESS',
            provider_booking_id: String(tripJackBookingId),
            provider_reference: pnrs.length ? pnrs.join(', ') : booking.provider_reference,
            booking_data: {
                ...bookingData,
                passengers,
                ...(pnrs.length && { pnr: pnrs.join(', '), pnrDetails }),
                tripJack: {
                    ...(bookingData.tripJack || {}),
                    ...(body && !checkError && { bookingDetails: body })
                },
                tripJackOrderStatus: orderStatus,
                statusChecks: checks,
                lastStatusCheckAt: new Date().toISOString(),
                ...(status === 'BOOKED' && {
                    confirmedAt: new Date().toISOString(),
                    // e-ticket numbers can come later: keep checking until complete
                    ticketSync: this.ticketSyncInfo({ ...bookingData, passengers, pnr: pnrs.join(', ') }, bookingData.ticketSync)
                }),
                // Paid but not booked: needs a refund
                ...(status === 'BOOKING_FAILED' && {
                    refundRequired: true,
                    bookingError: {
                        type: 'FLIGHT',
                        message: orderStatus
                            ? `Airline booking ${orderStatus.toLowerCase()}`
                            : 'No booking was created with the airline',
                        failedAt: new Date().toISOString()
                    },
                    ...(noOrder && { needsManualReview: true })
                }),
                // Still unknown after 30 minutes: ops must check it
                ...(status === 'BOOKING_IN_PROGRESS' && unresolvedFor > 30 * 60 * 1000 && { needsManualReview: true })
            }
        });

        console.log('TripJack flight status check:', {
            bookingId: booking.id,
            tripJackBookingId,
            source,
            orderStatus,
            status,
            pnrs,
            error: checkError
        });

        return { status, orderStatus, pnr: pnrs.join(', ') || null };
    }

    /* booking_data.ticketSync after a check: what is still missing */
    ticketSyncInfo(bookingData, previous = {}, extra = {}) {
        const state = ticketState(bookingData);
        const now = new Date().toISOString();
        return {
            ...(previous || {}),
            startedAt: previous?.startedAt || now,
            lastCheckAt: now,
            checks: Number(previous?.checks || 0) + 1,
            lcc: state.lcc,
            hasPnr: state.hasPnr,
            hasTickets: state.hasTickets,
            complete: state.complete,
            ...(state.complete && !previous?.completedAt && { completedAt: now }),
            ...extra
        };
    }

    /**
     * Booked flight with a missing PNR or e-ticket number: ask the supplier
     * again and save what has arrived. The booking stays BOOKED.
     * Low-cost airlines are complete with the PNR alone.
     */
    async syncFlightTickets(bookingOrId, { source = 'sweep', force = false } = {}) {
        const Booking = require('../models/Booking');
        const booking =
            typeof bookingOrId === 'object' && bookingOrId?.update
                ? await Booking.findByPk(bookingOrId.id)
                : await Booking.findByPk(bookingOrId);

        if (!booking || String(booking.booking_type).toUpperCase() !== 'FLIGHT' || booking.status !== 'BOOKED') {
            return null;
        }

        const bookingData = booking.booking_data || {};
        if (!force && !ticketCheckDue(bookingData)) return bookingData.ticketSync || null;

        const tripJackBookingId = booking.provider_booking_id || bookingData?.fareValidate?.request?.bookingId;
        if (!tripJackBookingId || !this.tripJackFlightService) return null;

        let body = null;
        let checkError = null;
        try {
            const response = await this.tripJackFlightService.bookingDetails({
                bookingId: tripJackBookingId,
                requirePaxPricing: true
            });
            body = response?.data ?? response;
            if (body?.status?.success === false) {
                checkError = body?.errors?.[0]?.message || 'Booking details not available';
            }
        } catch (error) {
            checkError = error.message;
        }

        if (checkError) {
            await booking.update({
                booking_data: {
                    ...bookingData,
                    ticketSync: this.ticketSyncInfo(bookingData, bookingData.ticketSync, { lastError: checkError, lastSource: source })
                }
            });
            console.error('Flight ticket sync failed:', booking.id, checkError);
            return null;
        }

        const orderStatus = String(body?.order?.status || '').toUpperCase() || null;
        const travellers = Array.isArray(body?.itemInfos?.AIR?.travellerInfos) ? body.itemInfos.AIR.travellerInfos : [];
        const { passengers, pnrDetails, pnrs } = mapTravellers(bookingData, travellers);

        const nextData = {
            ...bookingData,
            passengers,
            ...(pnrs.length && { pnr: pnrs.join(', '), pnrDetails }),
            tripJack: { ...(bookingData.tripJack || {}), bookingDetails: body },
            tripJackOrderStatus: orderStatus
        };
        nextData.ticketSync = this.ticketSyncInfo(nextData, bookingData.ticketSync, { lastError: null, lastSource: source });
        // the supplier no longer reports the order as ticketed: ops must look at it
        if (orderStatus && orderStatus !== 'SUCCESS') nextData.needsManualReview = true;

        await booking.update({
            provider_reference: pnrs.length ? pnrs.join(', ') : booking.provider_reference,
            booking_data: nextData
        });

        console.log('Flight ticket sync:', {
            bookingId: booking.id,
            source,
            orderStatus,
            pnrs,
            complete: nextData.ticketSync.complete,
            lcc: nextData.ticketSync.lcc
        });
        return nextData.ticketSync;
    }

    /**
     * Keep checking a pending flight in the background
     * (not awaited, so the payment webhook returns fast).
     */
    pollFlightBooking(bookingId, delaysInSeconds = [5, 10, 20, 30, 60, 120, 300]) {
        const run = async (step) => {
            if (step >= delaysInSeconds.length) return;
            await this.wait(delaysInSeconds[step] * 1000);
            try {
                const result = await this.reconcileFlightBooking(bookingId, { source: `poll-${step + 1}` });
                if (result.status === 'BOOKING_IN_PROGRESS') await run(step + 1);
            } catch (error) {
                console.error('Flight status poll failed:', bookingId, error.message);
                await run(step + 1);
            }
        };
        run(0).catch(() => {});
    }

    /**
     * Safety net (also after a server restart): every 2 minutes,
     * re-check paid flight bookings that are still in progress.
     */
    startFlightBookingReconciler(intervalMs = 2 * 60 * 1000) {
        if (this.flightReconcilerTimer) return;

        const sweep = async () => {
            if (this.flightReconcilerRunning) return;
            this.flightReconcilerRunning = true;
            try {
                const { Op } = require('sequelize');
                const Booking = require('../models/Booking');
                const pending = await Booking.findAll({
                    where: {
                        booking_type: { [Op.in]: ['FLIGHT', 'HOTEL'] },
                        status: 'BOOKING_IN_PROGRESS',
                        payment_status: 'SUCCESS',
                        updated_at: { [Op.gte]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
                    },
                    limit: 25
                });

                for (const booking of pending) {
                    const last = Date.parse(booking.booking_data?.lastStatusCheckAt || 0);
                    if (Date.now() - last < 90 * 1000) continue;
                    if (String(booking.booking_type).toUpperCase() === 'HOTEL') {
                        // hotel rows keep their status in booking_data.tripjack
                        if (Date.now() - Date.parse(booking.updated_at || 0) < 90 * 1000) continue;
                        await this.reconcileHotelBooking(booking).catch((error) =>
                            console.error('Hotel reconcile failed:', booking.id, error.message)
                        );
                        continue;
                    }
                    await this.reconcileFlightBooking(booking, { source: 'sweep' });
                }

                // Booked flights still waiting for a PNR / e-ticket number
                const { literal } = require('sequelize');
                const waitingTickets = await Booking.findAll({
                    where: {
                        booking_type: 'FLIGHT',
                        status: 'BOOKED',
                        created_at: { [Op.gte]: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
                        [Op.and]: [
                            literal(`COALESCE(booking_data #>> '{ticketSync,complete}', 'false') <> 'true'`),
                            literal(`COALESCE(booking_data #>> '{ticketSync,gaveUp}', 'false') <> 'true'`)
                        ]
                    },
                    // longest unchecked first
                    order: [[literal(`booking_data #>> '{ticketSync,lastCheckAt}'`), 'ASC NULLS FIRST']],
                    limit: 25
                });
                for (const booking of waitingTickets) {
                    const data = booking.booking_data || {};
                    if (ticketSyncExpired(data)) {
                        // still missing a day after departure: hand over to operations
                        await booking.update({
                            booking_data: {
                                ...data,
                                needsManualReview: true,
                                ticketSync: { ...(data.ticketSync || {}), gaveUp: true, gaveUpAt: new Date().toISOString() }
                            }
                        });
                        continue;
                    }
                    if (!ticketCheckDue(data)) continue;
                    await this.syncFlightTickets(booking, { source: 'sweep' }).catch((error) =>
                        console.error('Flight ticket sync error:', booking.id, error.message)
                    );
                }
            } catch (error) {
                console.error('Flight booking reconciler error:', error.message);
            } finally {
                this.flightReconcilerRunning = false;
            }
        };

        this.flightReconcilerTimer = setInterval(sweep, intervalMs);
        if (this.flightReconcilerTimer.unref) this.flightReconcilerTimer.unref();
        setTimeout(sweep, 15 * 1000);
    }

    /**
     * Payment failed / cancelled at the gateway: the booking must say so
     * (otherwise the customer page keeps showing "processing").
     */
    async markBookingPaymentFailed(payment, callbackData = {}) {
        try {
            const Booking = require('../models/Booking');
            const booking = payment?.booking_id ? await Booking.findByPk(payment.booking_id) : null;
            if (!booking || booking.payment_status === 'SUCCESS') return;

            await booking.update({
                status: 'PAYMENT_FAILED',
                payment_status: 'FAILED',
                booking_data: {
                    ...(booking.booking_data || {}),
                    paymentFailure: {
                        merchantTxnNo: payment.merchant_txn_no,
                        responseCode: callbackData.responseCode || callbackData.txnResponseCode || null,
                        message: callbackData.respDescription || callbackData.txnRespDescription || null,
                        at: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            console.error('Unable to mark booking payment failed:', error.message);
        }
    }

    /**
     * ICICI "command" API (STATUS / REFUND): form fields + secureHash.
     */
    async iciciCommand(config, fields) {
        const base = String(config.base_url || '').replace(/\/+$/, '');
        // Command API (STATUS / REFUND) lives next to the sale API:
        // "/tsp/pg/api/v2/initiateSale" -> "/tsp/pg/api/command"
        // (without the "/tsp" prefix ICICI answers 404)
        const prefix = String(config.initiate_sale_url || '').match(/^(.*?)\/pg\/api\//)?.[1] ?? '/tsp';
        const path = config.command_url || `${prefix}/pg/api/command`;
        const url = /^https?:/i.test(path) ? path : `${base}/${path.replace(/^\/+/, '')}`;

        const payload = {
            merchantId: config.merchant_id,
            aggregatorID: config.aggregator_id,
            ...fields
        };
        payload.secureHash = createSecureHash(payload, config.secure_key);

        const response = await axios.post(url, new URLSearchParams(payload).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 30000
        });

        return response.data || {};
    }

    /**
     * No callback received (customer closed the page etc.):
     * ask ICICI for the result of the sale.
     */
    async checkPaymentStatus(payment, environment = 'UAT') {
        if (!payment || payment.status !== 'pending') {
            return { checked: false, status: payment?.status || null };
        }

        const config = await this.getGatewayConfig(environment);
        const result = await this.iciciCommand(config, {
            merchantTxnNo: payment.merchant_txn_no,
            originalTxnNo: payment.merchant_txn_no,
            transactionType: 'STATUS'
        });

        const txnStatus = String(result.txnStatus || '').toUpperCase();
        const txnCode = String(result.txnResponseCode || '').trim();
        const okCode = ['000', '0000'].includes(txnCode);

        await payment.update({
            payment_data: {
                ...(payment.payment_data || {}),
                lastStatusCheck: { at: new Date().toISOString(), txnStatus, txnCode, responseCode: result.responseCode || null }
            }
        });

        const Booking = require('../models/Booking');
        const booking = payment.booking_id ? await Booking.findByPk(payment.booking_id) : null;

        // Paid: run the normal post-payment flow (booking with the airline)
        if (txnStatus === 'SUC' && okCode) {
            const paidAmount = Number(result.amount);
            if (Number.isFinite(paidAmount) && Math.round(paidAmount * 100) !== Math.round(Number(payment.amount) * 100)) {
                throw new Error('Payment amount mismatch');
            }
            await this.processVerifiedPayment(payment, {
                ...result,
                responseCode: '0000',
                bookingTypeHint: booking?.booking_type
            });
            return { checked: true, status: 'success' };
        }

        // Clearly not paid
        if (['REJ', 'ERR', 'FAIL', 'FAILED'].includes(txnStatus) || (txnCode && !okCode && txnStatus !== 'REQ')) {
            await this.markBookingPaymentFailed(payment, result);
            await payment.update({ status: 'failed', gateway_response: result });
            return { checked: true, status: 'failed' };
        }

        return { checked: true, status: 'pending' };
    }

    /**
     * Refund (full or partial) through ICICI.
     * Returns { status: SUCCESS | PROCESSING | FAILED, ... }.
     */
    async refundPayment({ payment, amount, environment = 'UAT' }) {
        if (!payment || payment.status !== 'success') {
            throw new Error('Only a successful payment can be refunded');
        }

        const config = await this.getGatewayConfig(environment);
        const refundTxnNo = `RFD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

        const result = await this.iciciCommand(config, {
            merchantTxnNo: refundTxnNo,
            originalTxnNo: payment.merchant_txn_no,
            transactionType: 'REFUND',
            amount: Number(amount).toFixed(2)
        });

        const responseCode = String(result.responseCode || '').trim();
        const txnStatus = String(result.txnStatus || '').toUpperCase();
        const accepted = ['000', '0000'].includes(responseCode);

        let status = 'FAILED';
        if (accepted && txnStatus === 'SUC') status = 'SUCCESS';
        else if (accepted) status = 'PROCESSING';

        return {
            status,
            refundTxnNo,
            gatewayRef: result.txnID || null,
            message: result.respDescription || result.txnRespDescription || null,
            response: result
        };
    }

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

        return this.processVerifiedPayment(payment, callbackData);
    }

    /**
     * Payment result already verified (webhook hash or STATUS API).
     * Handles failure, idempotency and the booking after a success.
     */
    async processVerifiedPayment(payment, callbackData) {

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

        // Already captured: a later (duplicate / failure) callback must not change it
        if (payment.status === 'success') {
            return {
                success: true,
                alreadyProcessed: true,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: payment.status
            };
        }

        // 10. Payment failed
        if (!isSuccess) {
            await this.markBookingPaymentFailed(payment, callbackData);

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
        const bookingType = String(
            callbackData.addlParam2 ||
            callbackData.bookingTypeHint ||
            ''
        )
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

        // 13. Mark payment successful: only one request may win this
        const [claimed] = await Payment.update(
            { status: 'success' },
            { where: { id: payment.id, status: 'pending' } }
        );

        if (!claimed) {
            return {
                success: true,
                alreadyProcessed: true,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: 'success'
            };
        }

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
                // 21. TRIPJACK BOOK (no fare validate here)
                // A timeout / network error does NOT mean the booking
                // failed: TripJack may still have booked it.
                // =====================================================

                let bookResponse = null;
                let bookError = null;

                try {
                    bookResponse =
                        await this.tripJackFlightService.book(
                            tripJackBookPayload
                        );
                } catch (error) {
                    bookError = error;
                    console.error('TripJack book call error (will verify with booking-details):', error.message);
                }

                const bookBody =
                    bookResponse?.data ?? bookResponse;

                const bookRejected =
                    !bookError &&
                    (
                        bookBody?.status?.success === false ||
                        bookBody?.status?.httpStatus >= 400
                    );

                await existingBooking.update({
                    provider_booking_id:
                        String(tripJackBookPayload.bookingId),
                    booking_data: {
                        ...bookingData,
                        tripJack: {
                            ...(bookingData.tripJack || {}),
                            fareValidate:
                                fareValidateData.response || null,
                            book: bookResponse || {
                                error: bookError?.message || 'No response'
                            }
                        },
                        bookRequestedAt: new Date().toISOString()
                    }
                });

                // =====================================================
                // 22. CONFIRM WITH BOOKING DETAILS
                // =====================================================

                await this.wait(bookRejected ? 1000 : 4000);

                const firstCheck =
                    await this.reconcileFlightBooking(
                        existingBooking.id,
                        { source: 'after-book' }
                    );

                // TripJack rejected the book and nothing was booked
                if (bookRejected && firstCheck.status !== 'BOOKED') {
                    throw new Error(
                        bookBody?.errors?.[0]?.message ||
                        'TripJack booking failed'
                    );
                }

                // Still pending: keep checking in the background
                if (firstCheck.status === 'BOOKING_IN_PROGRESS') {
                    this.pollFlightBooking(existingBooking.id);
                }

                const finalBooking =
                    await bookingService.findById(
                        existingBooking.id
                    );

                return {
                    success: true,
                    alreadyProcessed: false,
                    paymentId: payment.id,
                    merchantTxnNo: payment.merchant_txn_no,
                    status: 'success',
                    bookingStatus: firstCheck.status,
                    bookingType: 'FLIGHT',
                    pnr: firstCheck.pnr,
                    booking: finalBooking || existingBooking
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