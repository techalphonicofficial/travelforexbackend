const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CustomTrip = sequelize.define('CustomTrip', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true, // Nullable if building trip as guest
        references: { model: 'customers', key: 'id' }
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    tax_breakdown: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'booked', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
    }
}, {
    tableName: 'custom_trips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CustomTrip;
