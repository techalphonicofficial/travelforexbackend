const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Booking = sequelize.define(
    'Booking',
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        booking_reference: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },

        booking_type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },

        provider: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        provider_booking_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        provider_reference: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        status: {
            type: DataTypes.STRING(40),
            allowNull: false,
            defaultValue: 'INITIATED'
        },

        payment_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'PENDING'
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'INR'
        },

        correlation_id: {
            type: DataTypes.STRING(150),
            allowNull: true
        },

        booking_data: {
            type: DataTypes.JSONB,
            allowNull: true
        },

        payment_data: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    },
    {
        tableName: 'bookings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Booking;