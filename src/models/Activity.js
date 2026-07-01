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
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    source_type: {
        type: DataTypes.ENUM('manual', 'third_party'),
        allowNull: false,
        defaultValue: 'manual'
    },
    provider_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    }
}, {
    tableName: 'activities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations moved to container.js

module.exports = Activity;
