const sequelize = require('./src/database');

async function run() {
    try {
        await sequelize.query('ALTER TABLE destinations RENAME COLUMN activities TO activities_data;');

    } catch (e) {
        if (e.message.includes("no such column")) {

        } else {
             console.error(e);
        }
    } finally {
        process.exit();
    }
}
run();
