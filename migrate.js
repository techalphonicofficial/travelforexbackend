/**
 * Custom Migration Runner
 * Runs all migration files in order using Sequelize's queryInterface
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sequelize = require('./src/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'SequelizeMeta';

async function ensureMigrationsTable() {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    if (!tables.includes(MIGRATIONS_TABLE)) {
        await queryInterface.createTable(MIGRATIONS_TABLE, {
            name: {
                type: require('sequelize').DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true
            }
        });
        console.log(`✅ Created "${MIGRATIONS_TABLE}" tracking table`);
    }
}

async function getCompletedMigrations() {
    const [results] = await sequelize.query(`SELECT name FROM "${MIGRATIONS_TABLE}" ORDER BY name ASC`);
    return results.map(r => r.name);
}

async function recordMigration(name) {
    await sequelize.query(`INSERT INTO "${MIGRATIONS_TABLE}" (name) VALUES (:name)`, {
        replacements: { name }
    });
}

async function runMigrations() {
    try {
        console.log('\n🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected!\n');

        await ensureMigrationsTable();

        // Get all migration files sorted in order
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.js'))
            .sort();

        const completed = await getCompletedMigrations();
        const pending = files.filter(f => !completed.includes(f));

        if (pending.length === 0) {
            console.log('✅ No pending migrations. Database is up to date!\n');
            await sequelize.close();
            return;
        }

        console.log(`📋 Found ${pending.length} pending migration(s):\n`);
        const queryInterface = sequelize.getQueryInterface();

        for (const file of pending) {
            const migrationPath = path.join(MIGRATIONS_DIR, file);
            const migration = require(migrationPath);

            process.stdout.write(`  ▶  Running: ${file} ...`);
            try {
                await migration.up(queryInterface, require('sequelize'));
                await recordMigration(file);
                console.log(' ✅ Done');
            } catch (err) {
                console.log(` ❌ FAILED\n`);
                console.error(`Error in ${file}:\n`, err.message);
                console.log('\n⛔ Migration stopped. Fix the error and try again.\n');
                process.exit(1);
            }
        }

        console.log(`\n🎉 All ${pending.length} migration(s) ran successfully!\n`);
        await sequelize.close();

    } catch (err) {
        console.error('\n❌ Migration runner failed:', err.message);
        process.exit(1);
    }
}

runMigrations();
