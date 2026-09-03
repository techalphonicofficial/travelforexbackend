const sequelize = require('./src/database');

async function updateSchema() {
    try {

        await sequelize.query(`ALTER TABLE custom_trip_days ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id);`);

    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
