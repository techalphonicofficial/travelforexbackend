const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'mydb',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'Techalphonic@123',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'postgres',
        logging: false, // Set to true if you want to see SQL queries in logs
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;
