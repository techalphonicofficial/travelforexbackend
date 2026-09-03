const { models } = require('./src/container');

async function syncNewTables() {
    try {

        await models.Activity.sync({ alter: true });


        await models.Hotel.sync();


        await models.CustomTrip.sync();


        await models.CustomTripDay.sync();


        await models.CustomTripActivity.sync();


        await models.Booking.sync();


        await models.Payment.sync();


        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

syncNewTables();
