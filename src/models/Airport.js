const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Airport = sequelize.define('Airport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ident: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    latitude_deg: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: true
    },
    longitude_deg: {
        type: DataTypes.DECIMAL(15, 8),
        allowNull: true
    },
    elevation_ft: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    continent: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    iso_country: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    iso_region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    municipality: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    scheduled_service: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    gps_code: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    iata_code: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    local_code: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    home_link: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    wikipedia_link: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    keywords: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'airports',
    timestamps: false
});

module.exports = Airport;
