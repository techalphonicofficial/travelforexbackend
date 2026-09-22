const { DataTypes } = require('sequelize');

const sequelize = require('../database');

const ProviderConfig = sequelize.define(
    'ProviderConfig',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        provider_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        api_key: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        hotel_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        flight_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        environment: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'TEST'
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        tableName: 'provider_configs',
        timestamps: false
    }
);

module.exports = ProviderConfig;