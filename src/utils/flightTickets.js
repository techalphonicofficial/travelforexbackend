/**
 * PNR / e-ticket number helpers for flight bookings.
 *
 * The airline gives the PNR when the seat is confirmed. Full-service
 * airlines then issue a 13-digit e-ticket number per passenger, often a
 * few minutes (sometimes hours) later. Low-cost airlines (isLcc) usually
 * issue no separate ticket number: the PNR is the ticket reference.
 */

const HOUR = 60 * 60 * 1000;

/* every flight segment of the booking (review first, then supplier details) */
const segmentsOf = (bookingData = {}) => {
    const fromTrips = (trips) =>
        (Array.isArray(trips) ? trips : []).flatMap((trip) => (Array.isArray(trip?.sI) ? trip.sI : []));
    const review = fromTrips(bookingData.review?.tripInfos);
    if (review.length) return review;
    return fromTrips(bookingData.tripJack?.bookingDetails?.itemInfos?.AIR?.tripInfos);
};

/* true only when every segment is flown by a low-cost airline */
const isAllLcc = (bookingData = {}) => {
    const segments = segmentsOf(bookingData);
    return segments.length > 0 && segments.every((segment) => segment?.fD?.aI?.isLcc === true);
};

const departureOf = (bookingData = {}) => {
    const first = segmentsOf(bookingData)[0];
    const time = first?.dt ? Date.parse(first.dt) : NaN;
    return Number.isNaN(time) ? null : time;
};

/*
 * Copy PNR and ticket numbers from supplier travellers onto our passengers
 * (matched by name, else by position). Values we already have are kept
 * when the supplier sends nothing for them.
 */
const mapTravellers = (bookingData = {}, travellers = []) => {
    const pnrDetails = { ...(bookingData.pnrDetails || {}) };
    travellers.forEach((traveller) =>
        Object.entries(traveller?.pnrDetails || {}).forEach(([sector, pnr]) => {
            if (pnr) pnrDetails[sector] = pnr;
        })
    );
    const pnrs = [...new Set(Object.values(pnrDetails).filter(Boolean))];

    const passengers = (Array.isArray(bookingData.passengers) ? bookingData.passengers : []).map((passenger, index) => {
        const sameName = (traveller) =>
            String(traveller?.fN || '').trim().toLowerCase() === String(passenger?.firstName || '').trim().toLowerCase() &&
            String(traveller?.lN || '').trim().toLowerCase() === String(passenger?.lastName || '').trim().toLowerCase();
        const traveller = travellers.find(sameName) || travellers[index];
        if (!traveller) return passenger;

        const tickets = [...new Set(Object.values(traveller.ticketNumberDetails || {}).filter(Boolean))];
        const travellerPnrs = [...new Set(Object.values(traveller.pnrDetails || {}).filter(Boolean))];

        return {
            ...passenger,
            ...(tickets.length && { ticketNumber: tickets.join(', '), ticketNumberDetails: traveller.ticketNumberDetails }),
            ...(travellerPnrs.length && { pnr: travellerPnrs.join(', '), pnrDetails: traveller.pnrDetails })
        };
    });

    return { passengers, pnrDetails, pnrs };
};

/* what is still missing on a booked flight */
const ticketState = (bookingData = {}) => {
    const passengers = Array.isArray(bookingData.passengers) ? bookingData.passengers : [];
    const lcc = isAllLcc(bookingData);
    const hasPnr = passengers.length
        ? passengers.every((p) => p?.pnr || bookingData.pnr)
        : Boolean(bookingData.pnr);
    const hasTickets = passengers.length > 0 && passengers.every((p) => p?.ticketNumber);
    // low-cost airlines: the PNR is enough
    const complete = hasPnr && (hasTickets || lcc);
    return { lcc, hasPnr, hasTickets, complete };
};

/* 24 hours after departure we stop asking (operations team takes over) */
const ticketSyncExpired = (bookingData = {}, now = Date.now()) => {
    const departure = departureOf(bookingData);
    return Boolean(departure && now > departure + 24 * HOUR);
};

/*
 * When to ask the supplier again for a booked flight with missing details:
 * every 5 minutes for the first 2 hours after confirmation, then hourly,
 * until 24 hours after departure (then it is left to the operations team).
 */
const ticketCheckDue = (bookingData = {}, now = Date.now()) => {
    const state = ticketState(bookingData);
    if (state.complete) return false;

    if (ticketSyncExpired(bookingData, now)) return false;

    const confirmedAt = Date.parse(bookingData.confirmedAt || bookingData.ticketSync?.startedAt || 0) || now;
    const every = now - confirmedAt < 2 * HOUR ? 5 * 60 * 1000 : HOUR;
    const last = Date.parse(bookingData.ticketSync?.lastCheckAt || 0) || 0;
    return now - last >= every;
};

module.exports = {
    segmentsOf,
    isAllLcc,
    departureOf,
    mapTravellers,
    ticketState,
    ticketSyncExpired,
    ticketCheckDue
};
