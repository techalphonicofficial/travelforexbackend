/**
 * Customer-facing view of a booking.
 *
 * Customers must only see a travel-forex booking: no supplier name,
 * supplier booking ids, raw supplier payloads or internal logs.
 * Admin screens use the full booking instead.
 */

const SUPPLIER_TEXT = /\btrip\s*jack('s)?\b\s*/gi;
// supplier booking ids: TJS... (flights), TJP... (hotels)
const SUPPLIER_ID = /^TJ[A-Z]\d{6,}$/i;

/* Supplier-free error / status text for customers */
const customerMessage = (message, fallback = 'Something went wrong. Please try again.') => {
    let text = String(message || '').replace(SUPPLIER_TEXT, '').replace(/\s{2,}/g, ' ').trim();
    if (!text) return fallback;

    // Technical / internal messages are not shown as they are
    if (/bookingId is missing|payload is missing|not configured|ECONN|ETIMEDOUT|timeout of \d+ms|socket hang up|status code 5\d\d|Unexpected token|Cannot read prop/i.test(text)) {
        return fallback;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/* Remove supplier ids / names from any nested value */
const scrub = (value) => {
    if (Array.isArray(value)) return value.map(scrub);
    // dates (created_at, updated_at) stay dates, not {}
    if (value instanceof Date) return value;
    if (value && typeof value === 'object') {
        const out = {};
        Object.entries(value).forEach(([key, child]) => {
            if (typeof child === 'string' && SUPPLIER_ID.test(child.trim())) return;
            out[key] = scrub(child);
        });
        return out;
    }
    if (typeof value === 'string') return value.replace(SUPPLIER_TEXT, '').trim();
    return value;
};

const pick = (source, keys) =>
    keys.reduce((acc, key) => {
        if (source && source[key] !== undefined) acc[key] = source[key];
        return acc;
    }, {});

/* Customer status: hide internal states behind clear wording */
const CUSTOMER_STATUS = {
    INITIATED: 'PAYMENT_PENDING',
    REVIEW_FAILED: 'NOT_CONFIRMED',
    BOOKING_IN_PROGRESS: 'BOOKING_IN_PROGRESS',
    BOOKED: 'BOOKED',
    BOOKING_FAILED: 'BOOKING_FAILED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAYMENT_NOT_COMPLETED: 'PAYMENT_NOT_COMPLETED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
};

const toFlightData = (data) => {
    const review = data.review || {};
    const passengers = (Array.isArray(data.passengers) ? data.passengers : []).map((p) => ({
        ...pick(p, ['id', 'type', 'title', 'firstName', 'lastName', 'dob', 'isLead', 'pnr', 'pnrDetails', 'ticketNumber', 'ticketNumberDetails']),
        // documents are shown masked only
        ...(p.passportNumber && { passportNumber: `XXXX${String(p.passportNumber).slice(-4)}` }),
    }));

    return {
        version: data.version,
        tripType: data.tripType,
        search: data.search,
        review: {
            tripInfos: review.tripInfos,
            totalPriceInfo: review.totalPriceInfo,
            searchQuery: pick(review.searchQuery, ['routeInfos', 'cabinClass', 'paxInfo', 'isDomestic']),
        },
        selectedFare: data.selectedFare,
        passengers,
        contact: data.contact,
        gstInfo: data.gstInfo ? pick(data.gstInfo, ['gstNumber', 'registeredName']) : null,
        addOns: data.addOns,
        seatSelection: data.seatSelection,
        amountBreakup: data.amountBreakup,
        pnr: data.pnr,
        pnrDetails: data.pnrDetails,
        confirmedAt: data.confirmedAt,
        // PNR / e-ticket numbers still on their way (no supplier details)
        ticketing: data.ticketSync
            ? pick(data.ticketSync, ['lcc', 'hasPnr', 'hasTickets', 'complete', 'gaveUp', 'lastCheckAt'])
            : undefined,
        refunds: (Array.isArray(data.refunds) ? data.refunds : [])
            .filter((r) => ['SUCCESS', 'PROCESSING', 'MANUAL'].includes(r.status))
            .map((r) => pick(r, ['amount', 'status', 'createdAt', 'completedAt'])),
        // internal error text is not shown to customers
        ...(data.bookingError && { bookingError: { message: 'We could not confirm your booking with the airline.', failedAt: data.bookingError.failedAt } }),
    };
};

/* documents are shown masked only: ABCDE1234F -> ABCD•••••F, Z1234567 -> XXXX4567 */
const maskGuestDocs = (guest) => {
    if (!guest || typeof guest !== 'object') return guest;
    const { pan, passportNumber, ...rest } = guest;
    return {
        ...rest,
        ...(pan && { pan: `${String(pan).slice(0, 4)}•••••${String(pan).slice(-1)}` }),
        ...(passportNumber && { passportNumber: `XXXX${String(passportNumber).slice(-4)}` }),
    };
};

const toHotelData = (data) => {
    const supplier = data.tripjack || data.tripJack || {};
    return {
        ...data,
        guests: Array.isArray(data.guests) ? data.guests.map(maskGuestDocs) : data.guests,
        primaryGuest: maskGuestDocs(data.primaryGuest),
        // keep only what the hotel voucher needs from the supplier copy
        tripjack: undefined,
        stay: {
            summary: supplier.summary,
            review: supplier.review ? { option: pick(supplier.review.option, ['pricing', 'roomInfo', 'mealBasis', 'cancellation', 'inclusions', 'deadlineDateTime']) } : undefined,
            selectedOption: supplier.selectedOption ? pick(supplier.selectedOption, ['pricing', 'roomInfo', 'mealBasis']) : undefined,
            hotelConfirmationNumber: supplier.hotelConfirmationNumber,
            pnr: supplier.pnr,
            ...(supplier.bookError && { bookError: customerMessage(supplier.bookError, 'We could not confirm your hotel booking.') }),
        },
        tripJack: undefined,
        validation: undefined,
        validationError: undefined,
        fareValidate: undefined,
        statusChecks: undefined,
        ...(data.bookingError && { bookingError: { message: customerMessage(data.bookingError.message, 'We could not confirm your booking.') } }),
    };
};

const toCustomerBooking = (booking) => {
    if (!booking) return booking;
    const row = booking.get ? booking.get({ plain: true }) : booking;
    const data = row.booking_data || {};
    const isFlight = String(row.booking_type).toUpperCase() === 'FLIGHT';

    const refundedAmount = (Array.isArray(data.refunds) ? data.refunds : [])
        .filter((r) => ['SUCCESS', 'MANUAL'].includes(r.status))
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return scrub({
        id: row.id,
        booking_reference: row.booking_reference,
        booking_type: row.booking_type,
        status: CUSTOMER_STATUS[row.status] || row.status,
        payment_status: row.payment_status,
        amount: row.amount,
        currency: row.currency,
        refunded_amount: refundedAmount || 0,
        pnr: isFlight ? data.pnr || null : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        booking_data: isFlight ? toFlightData(data) : toHotelData(data),
        payment_data: row.payment_data ? pick(row.payment_data, ['merchantTxnNo', 'status', 'paid_at']) : null,
    });
};

module.exports = {
    customerMessage,
    toCustomerBooking,
};
