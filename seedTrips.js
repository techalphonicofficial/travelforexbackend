const { db, models, services } = require('./src/container');

async function seedTrips() {
    try {
        console.log('Starting seed...');
        
        const { tripBuilderService } = services;
        const { Customer, Destination, Activity, Hotel, Booking } = models;

        // Ensure we have a customer
        let customer = await Customer.findOne();
        if (!customer) {
            customer = await Customer.create({
                name: 'Test Customer',
                email: 'testcustomer' + Date.now() + '@example.com',
                phone: '9876543210'
            });
        }

        // Get a destination
        const destination = await Destination.findOne();
        if (!destination) {
            console.log('No destination found. Please seed basic data first.');
            process.exit(1);
        }

        // Create some dummy hotels if they don't exist
        let hotel1 = await Hotel.findOne({ where: { name: 'Grand Resort' } });
        if (!hotel1) {
            hotel1 = await Hotel.create({
                name: 'Grand Resort',
                destination_id: destination.id,
                star_rating: 5,
                price_per_night: 15000,
                address: 'Beachfront Road'
            });
        }

        let hotel2 = await Hotel.findOne({ where: { name: 'City Hotel' } });
        if (!hotel2) {
            hotel2 = await Hotel.create({
                name: 'City Hotel',
                destination_id: destination.id,
                star_rating: 4,
                price_per_night: 8000,
                address: 'Downtown'
            });
        }

        // Create some dummy activities
        let activity1 = await Activity.findOne({ where: { name: 'Scuba Diving' } });
        if (!activity1) {
            activity1 = await Activity.create({
                name: 'Scuba Diving',
                destination_id: destination.id,
                price: 4500,
                duration_minutes: 180
            });
        }

        let activity2 = await Activity.findOne({ where: { name: 'City Tour' } });
        if (!activity2) {
            activity2 = await Activity.create({
                name: 'City Tour',
                destination_id: destination.id,
                price: 2000,
                duration_minutes: 120
            });
        }

        console.log('Creating 4 custom trips and bookings...');

        for (let i = 0; i < 4; i++) {
            // Initialize trip
            let trip = await tripBuilderService.initializeTrip(
                customer.id, 
                destination.id, 
                '2026-06-01', 
                '2026-06-05' // 4 nights
            );

            // Add hotels to days
            await tripBuilderService.setHotelForDay(trip.id, 1, hotel1.id);
            await tripBuilderService.setHotelForDay(trip.id, 2, hotel1.id);
            await tripBuilderService.setHotelForDay(trip.id, 3, hotel2.id);
            await tripBuilderService.setHotelForDay(trip.id, 4, hotel2.id);

            // Add activities
            await tripBuilderService.addActivityToDay(trip.id, 2, activity1.id);
            await tripBuilderService.addActivityToDay(trip.id, 3, activity2.id);

            // Fetch updated trip to get final price
            trip = await tripBuilderService.getTripDetails(trip.id);

            // Create Booking
            await models.Booking.create({
                customer_id: customer.id,
                booking_reference: 'PT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                type: 'custom_trip',
                custom_trip_id: trip.id,
                total_amount: trip.total_price,
                payment_status: 'paid',
                booking_status: 'confirmed'
            });
            console.log(`Created booking for custom trip ${trip.id}`);
        }

        console.log('Seed completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
}

seedTrips();
