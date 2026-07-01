const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Country = require('./Country');

const ForexService = sequelize.define('ForexService', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Country, key: 'id' }
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    exchange_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'forex_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['country_id'] },
        { fields: ['code'] }
    ]
});

// Associations moved to container.js

module.exports = ForexService;
