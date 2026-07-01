const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Destination = require('./Destination');
const Category = require('./Category');

const DestinationCategory = sequelize.define('DestinationCategory', {
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Category, key: 'id' }
    }
}, {
    tableName: 'destination_categories',
    timestamps: false
});

// M:N via junction table
// Associations moved to container.js

module.exports = DestinationCategory;
