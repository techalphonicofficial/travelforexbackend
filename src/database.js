const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'mydb',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'Techalphonic@123',
    {
        host: process.env.DB_HOST || '187.127.154.235',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,

        dialectOptions: {
            connectTimeout: 30000
        },
//sfasdfasdfsadf
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected Successfully');
    } catch (err) {
        console.error('❌ PostgreSQL Connection Error:', err);
    }
})();

module.exports = sequelize;