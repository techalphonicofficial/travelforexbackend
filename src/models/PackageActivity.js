const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageActivity = sequelize.define('PackageActivity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    package_day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'package_days', key: 'id' }
    },
    time_slot: {
        type: DataTypes.STRING(50),
        defaultValue: 'Full Day'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'package_activities',
    timestamps: false
});

// Relationships moved to container.js to avoid circular dependencies.

module.exports = PackageActivity;
