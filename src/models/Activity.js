const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Destination = require('./Destination');

const Activity = sequelize.define('Activity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' }
    }
}, {
    tableName: 'activities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations moved to container.js

module.exports = Activity;
