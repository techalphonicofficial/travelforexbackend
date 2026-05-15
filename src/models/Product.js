const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    base_price: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    discount_type: {
        type: DataTypes.ENUM('amount', 'percent'),
        allowNull: true
    },
    discount_value: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
        defaultValue: 'active'
    },
    is_returnable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    return_window_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_free_shipping: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    shipping_charge: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meta_keywords: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;
