const sequelize = require('./src/database');

async function updateSchema() {
    try {
        console.log("Updating custom_trip_days schema...");
        await sequelize.query(`ALTER TABLE custom_trip_days ADD COLUMN IF NOT EXISTS title VARCHAR(255);`);
        await sequelize.query(`ALTER TABLE custom_trip_days ADD COLUMN IF NOT EXISTS description TEXT;`);
        
        console.log("Updating custom_trip_activities schema...");
        await sequelize.query(`ALTER TABLE custom_trip_activities ALTER COLUMN activity_id DROP NOT NULL;`);
        await sequelize.query(`ALTER TABLE custom_trip_activities ADD COLUMN IF NOT EXISTS title VARCHAR(255);`);
        await sequelize.query(`ALTER TABLE custom_trip_activities ADD COLUMN IF NOT EXISTS description TEXT;`);
        
        console.log("Schema updated successfully.");
    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
