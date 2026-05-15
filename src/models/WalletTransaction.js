const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Wallet = require('./Wallet');

const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Wallet,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('credit', 'debit'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reference_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = WalletTransaction;
