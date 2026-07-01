const { db } = require('./src/container');

async function run() {
    try {
        console.log("Altering tables...");
        
        // Use simpler type mapping for ENUM in postgres or just use VARCHAR to be safe in alter
        // Since we defined it as ENUM in sequelize, we should create the enum type if it doesn't exist
        await db.query(`DO $$ BEGIN
            CREATE TYPE enum_hotels_source_type AS ENUM('manual', 'third_party');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`);
        
        await db.query(`DO $$ BEGIN
            CREATE TYPE enum_activities_source_type AS ENUM('manual', 'third_party');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`);

        await db.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS source_type enum_hotels_source_type DEFAULT 'manual'");
        await db.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS provider_name VARCHAR(150)");
        
        await db.query("ALTER TABLE activities ADD COLUMN IF NOT EXISTS source_type enum_activities_source_type DEFAULT 'manual'");
        await db.query("ALTER TABLE activities ADD COLUMN IF NOT EXISTS provider_name VARCHAR(150)");

        console.log("Done altering tables.");
    } catch (e) {
        console.error(e);
    }
}

run().finally(() => process.exit(0));
