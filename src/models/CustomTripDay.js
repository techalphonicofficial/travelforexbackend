const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CustomTripDay = sequelize.define('CustomTripDay', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    custom_trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'custom_trips', key: 'id' }
    },
    day_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable for legacy data or if not set initially
        references: { model: 'destinations', key: 'id' }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'hotels', key: 'id' }
    }
}, {
    tableName: 'custom_trip_days',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CustomTripDay;
