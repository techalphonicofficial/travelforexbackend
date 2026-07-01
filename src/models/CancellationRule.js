const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CancellationRule = sequelize.define('CancellationRule', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    min_days_before_departure: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    max_days_before_departure: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    refund_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    cancellation_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'cancellation_rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CancellationRule;
