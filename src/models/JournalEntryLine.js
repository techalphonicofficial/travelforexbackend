const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const JournalEntry = require('./JournalEntry');
const Account = require('./Account');

const JournalEntryLine = sequelize.define('JournalEntryLine', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    journal_entry_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: JournalEntry,
            key: 'id'
        }
    },
    account_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Account,
            key: 'id'
        }
    },
    debit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    credit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    memo: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'journal_entry_lines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = JournalEntryLine;
