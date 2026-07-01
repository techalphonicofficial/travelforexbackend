const sequelize = require('./src/database');

async function updateSchema() {
    try {
        console.log("Updating custom_trip_days schema...");
        await sequelize.query(`ALTER TABLE custom_trip_days ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id);`);
        console.log("Schema updated successfully.");
    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
