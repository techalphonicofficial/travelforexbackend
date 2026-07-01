const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    voucher_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    voucher_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    voucher_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    financial_year: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'posted'
    },
    reference_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reference_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    party_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    party_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    narration: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    posted_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    cancelled_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    posted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'vouchers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Voucher;
