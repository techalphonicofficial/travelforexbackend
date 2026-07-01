const sequelize = require('./src/database');

async function fix() {
    try {
        await sequelize.query('ALTER TABLE blog_posts DROP COLUMN author_id;');
        console.log('Column dropped successfully.');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

fix();
