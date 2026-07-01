const sequelize = require('./src/database');

async function updateSchema() {
    try {
        console.log("Updating destinations schema...");
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';`);
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS state VARCHAR(100);`);
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tax_rule_type VARCHAR(50) DEFAULT 'domestic';`);
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) DEFAULT 5.00;`);
        await sequelize.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tcs_rate DECIMAL(5,2) DEFAULT 0.00;`);
        
        console.log("Updating custom_trips schema...");
        await sequelize.query(`ALTER TABLE custom_trips ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00;`);
        await sequelize.query(`ALTER TABLE custom_trips ADD COLUMN IF NOT EXISTS total_tax DECIMAL(10,2) DEFAULT 0.00;`);
        await sequelize.query(`ALTER TABLE custom_trips ADD COLUMN IF NOT EXISTS tax_breakdown JSON;`);
        
        console.log("Schema updated successfully.");
    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
