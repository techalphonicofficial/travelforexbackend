const { db } = require('./src/container');

async function check() {
    try {
        console.log('Adding columns if missing...');
        await db.query("ALTER TABLE packages ADD COLUMN IF NOT EXISTS price INTEGER");
        await db.query("ALTER TABLE package_days ADD COLUMN IF NOT EXISTS title VARCHAR(255)");
        console.log('Columns added successfully.');

        const [results] = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'packages'");
        console.log('Columns in packages:', results.map(r => r.column_name));
        
        const [dayResults] = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'package_days'");
        console.log('Columns in package_days:', dayResults.map(r => r.column_name));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
