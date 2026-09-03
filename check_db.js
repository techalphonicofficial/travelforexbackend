const { repositories: { bookingRepo, customTripRepo } } = require('./src/container');

async function verify() {
    try {

        const trips = await customTripRepo.CustomTrip.findAll({ limit: 1 });
        if (trips.length === 0) {

            // Check Payment association


        } else {
            const tripId = trips[0].id;

            const mockBooking = await bookingRepo.getBookingById(tripId);




        }
        process.exit(0);
    } catch (err) {
        console.error('Verification failed with error:', err);
        process.exit(1);
    }
}

verify();
