const { db } = require('./src/container');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Add custom_trip_id to payments first
        console.log('Adding custom_trip_id column to payments...');
        await db.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS custom_trip_id INTEGER;`);

        // 2. Transfer references from bookings to custom_trips
        console.log('Migrating existing payment records...');
        await db.query(`
            UPDATE payments 
            SET custom_trip_id = bookings.custom_trip_id 
            FROM bookings 
            WHERE payments.booking_id = bookings.id;
        `);

        // 3. Add constraint on custom_trip_id referencing custom_trips table
        console.log('Adding foreign key constraint for custom_trip_id to payments...');
        await db.query(`
            ALTER TABLE payments 
            ADD CONSTRAINT payments_custom_trip_id_fkey 
            FOREIGN KEY (custom_trip_id) 
            REFERENCES custom_trips(id) 
            ON DELETE CASCADE;
        `);

        // 4. Drop old foreign key constraint and column booking_id
        console.log('Dropping old booking_id column and constraints...');
        await db.query(`
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (
                    SELECT tc.constraint_name, tc.table_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
                    WHERE ccu.table_name = 'bookings' AND tc.table_name = 'payments'
                ) LOOP
                    EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
                END LOOP;
            END $$;
        `);
        
        await db.query(`ALTER TABLE payments DROP COLUMN IF EXISTS booking_id;`);

        // 5. Drop bookings table
        console.log('Dropping bookings table...');
        await db.query(`DROP TABLE IF EXISTS bookings CASCADE;`);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
