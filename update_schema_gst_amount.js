const sequelize = require('./src/database');

async function updateSchema() {
    try {
        console.log("Adding gst_amount to destinations table...");
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0.00;`);
        console.log("Database schema updated successfully.");
    } catch (e) {
        console.error("Error updating database schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
