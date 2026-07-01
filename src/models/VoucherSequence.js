const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const VoucherSequence = sequelize.define('VoucherSequence', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    voucher_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    financial_year: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false
    },
    current_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'voucher_sequences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['voucher_type', 'financial_year']
        }
    ]
});

module.exports = VoucherSequence;
