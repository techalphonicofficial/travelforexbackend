const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PaymentGatewayConfig = sequelize.define(
    'PaymentGatewayConfig',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        gateway: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        environment: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'UAT'
        },

        base_url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },

        merchant_id: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        aggregator_id: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        secure_key: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        initiate_sale_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        redirect_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'INR'
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: 'payment_gateway_configs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = PaymentGatewayConfig;