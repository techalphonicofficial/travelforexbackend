const sequelize = require('./src/database');

async function updateSchema() {
    try {

        // For PostgreSQL
        if (sequelize.getDialect() === 'postgres') {
            await sequelize.query(`ALTER TABLE app_settings ALTER COLUMN value TYPE TEXT;`);
        }
        // For MySQL / MariaDB
        else if (sequelize.getDialect() === 'mysql' || sequelize.getDialect() === 'mariadb') {
            await sequelize.query(`ALTER TABLE app_settings MODIFY value TEXT;`);
        }
        // For SQLite (cannot alter column easily, but SQLite doesn't enforce STRING(500) limit strictly)
        // If it's SQLite and it is throwing, we'd need to recreate the table or just let SQLite handle TEXT insertion implicitly.
        else {

        }


    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
