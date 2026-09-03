const sequelize = require('./src/database');

async function run() {
    try {
        await sequelize.query('ALTER TABLE destinations ADD COLUMN activities JSON;');

    } catch (e) {
        if (e.message.includes("duplicate column name")) {

        } else {
             console.error(e);
        }
    } finally {
        process.exit();
    }
}
run();
