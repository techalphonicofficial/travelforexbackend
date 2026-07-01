const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const JournalEntry = sequelize.define('JournalEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    entry_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reference_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reference_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    voucher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'vouchers',
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'journal_entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = JournalEntry;
