const sequelize = require('./src/database');

async function updateSchema() {
    try {
        console.log("Updating app_settings schema...");
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
            console.log("SQLite detected or other DB. It usually doesn't strictly enforce string length, but if needed, we'll recreate the table.");
        }
        
        console.log("Schema updated successfully.");
    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        process.exit();
    }
}

updateSchema();
