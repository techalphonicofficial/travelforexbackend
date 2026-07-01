const sequelize = require('./src/database');

async function run() {
    try {
        await sequelize.query('ALTER TABLE destinations ADD COLUMN activities JSON;');
        console.log("Successfully added activities column to destinations.");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
             console.log("Column already exists.");
        } else {
             console.error(e);
        }
    } finally {
        process.exit();
    }
}
run();
