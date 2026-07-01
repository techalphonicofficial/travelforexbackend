const { models } = require('./src/container');

async function syncNewTables() {
    try {
        console.log('Syncing Activity (alter)...');
        await models.Activity.sync({ alter: true });
        
        console.log('Syncing Hotel...');
        await models.Hotel.sync();
        
        console.log('Syncing CustomTrip...');
        await models.CustomTrip.sync();
        
        console.log('Syncing CustomTripDay...');
        await models.CustomTripDay.sync();
        
        console.log('Syncing CustomTripActivity...');
        await models.CustomTripActivity.sync();
        
        console.log('Syncing Booking...');
        await models.Booking.sync();
        
        console.log('Syncing Payment...');
        await models.Payment.sync();
        
        console.log('Database synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

syncNewTables();
