const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Destination = require('./Destination');
const City = require('./City');

const DestinationMapping = sequelize.define('DestinationMapping', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Destination, key: 'id' }
    },
    city_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: City, key: 'id' }
    }
}, {
    tableName: 'destination_mappings',
    timestamps: false
});

// Associations moved to container.js

module.exports = DestinationMapping;
