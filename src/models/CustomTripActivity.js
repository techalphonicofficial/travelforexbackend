const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CustomTripActivity = sequelize.define('CustomTripActivity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    custom_trip_day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'custom_trip_days', key: 'id' }
    },
    activity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'activities', key: 'id' }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'custom_trip_activities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CustomTripActivity;
