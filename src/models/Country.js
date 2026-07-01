const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Continent = require('./Continent');

const Country = sequelize.define('Country', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    continent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Continent, key: 'id' }
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
    }
}, {
    tableName: 'countries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations moved to container.js

module.exports = Country;
