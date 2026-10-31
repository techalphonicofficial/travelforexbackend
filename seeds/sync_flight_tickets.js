/**
 * One-time catch-up: fetch the latest PNR / e-ticket numbers from the
 * supplier for booked flights that are missing them.
 *
 *   node seeds/sync_flight_tickets.js            # dry run: list only
 *   node seeds/sync_flight_tickets.js --apply    # fetch and save
 *
 * New bookings do not need this: the background reconciler keeps
 * checking them automatically.
 */
require('dotenv').config();

const container = require('../src/container');
const Booking = require('../src/models/Booking');
const { ticketState } = require('../src/utils/flightTickets');

const apply = process.argv.includes('--apply');

(async () => {
    const { iciciPaymentService } = container.services;
    const rows = await Booking.findAll({
        where: { booking_type: 'FLIGHT', status: 'BOOKED', payment_status: 'SUCCESS' },
        order: [['created_at', 'DESC']]
    });

    const missing = rows.filter((row) => !ticketState(row.booking_data || {}).complete);
    console.log(`Booked flights: ${rows.length}, missing PNR / ticket details: ${missing.length}`);

    for (const row of missing) {
        const state = ticketState(row.booking_data || {});
        const label = `${row.booking_reference} (id ${row.id})`;
        if (!apply) {
            console.log(`- ${label}: PNR ${state.hasPnr ? 'yes' : 'no'}, tickets ${state.hasTickets ? 'yes' : 'no'}, low-cost ${state.lcc ? 'yes' : 'no'}`);
            continue;
        }
        try {
            const sync = await iciciPaymentService.syncFlightTickets(row, { source: 'catch-up', force: true });
            console.log(`- ${label}: ${sync ? (sync.complete ? 'complete' : 'still missing') : 'not updated'}`);
        } catch (error) {
            console.log(`- ${label}: error ${error.message}`);
        }
        // stay well inside the supplier rate limit
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    if (!apply && missing.length) console.log('\nDry run only. Run again with --apply to fetch and save.');
    process.exit(0);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
