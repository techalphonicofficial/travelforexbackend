const { repositories: { bookingRepo, customTripRepo } } = require('./src/container');

async function verify() {
    try {
        console.log('Querying all custom trips to get an ID...');
        const trips = await customTripRepo.CustomTrip.findAll({ limit: 1 });
        if (trips.length === 0) {
            console.log('No custom trips found, verifying model relationships instead...');
            // Check Payment association
            console.log('Associations on CustomTrip:', Object.keys(customTripRepo.CustomTrip.associations));
            console.log('Associations on Payment:', Object.keys(bookingRepo.Payment.associations));
        } else {
            const tripId = trips[0].id;
            console.log(`Verifying getBookingById for custom_trip ID ${tripId}...`);
            const mockBooking = await bookingRepo.getBookingById(tripId);
            console.log('Successfully retrieved CustomTrip via bookingRepo:');
            console.log('- ID:', mockBooking.id);
            console.log('- Customer:', mockBooking.customer ? 'Eager-loaded' : 'None');
            console.log('- Payments Count:', mockBooking.payments ? mockBooking.payments.length : 0);
        }
        process.exit(0);
    } catch (err) {
        console.error('Verification failed with error:', err);
        process.exit(1);
    }
}

verify();
