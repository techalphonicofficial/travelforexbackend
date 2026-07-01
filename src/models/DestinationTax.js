const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DestinationTax = sequelize.define('DestinationTax', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'destinations',
            key: 'id'
        }
    },
    tax_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    percent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    tableName: 'destination_taxes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations handled in container.js

module.exports = DestinationTax;
