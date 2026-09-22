const { DataTypes } = require('sequelize');

const sequelize = require('../database');

const Payment = sequelize.define(
    'Payment',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        // Existing custom trip payment support
        custom_trip_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'custom_trips',
                key: 'id'
            }
        },

        // New booking payment support
        booking_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },

        // User who made the payment
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'INR'
        },

        // Payment gateway
        gateway: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'ICICI_ORANGE_PG'
        },

        // Our transaction number sent to ICICI
        merchant_txn_no: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true
        },

        // Gateway transaction ID
        transaction_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        // ICICI transaction context
        tran_ctx: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true
        },

        // ICICI / payment related metadata
        payment_data: {
            type: DataTypes.JSONB,
            allowNull: true
        },

        // Complete gateway response
        gateway_response: {
            type: DataTypes.JSONB,
            allowNull: true
        },

        status: {
            type: DataTypes.ENUM(
                'pending',
                'success',
                'failed'
            ),
            allowNull: false,
            defaultValue: 'pending'
        },

        paid_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: 'payments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = Payment;