const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Media = require('./Media');

const Destination = sequelize.define('Destination', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'e.g. beach, mountain, heritage'
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meta_keyword: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    schema: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_trending: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_visa_free: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    customize: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_customizable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tax_rule_type: {
        type: DataTypes.ENUM('domestic', 'international_outbound', 'exempt'),
        allowNull: false,
        defaultValue: 'domestic'
    },
    gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5.00
    },
    tcs_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    feature_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    feature_image_alt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: true
    },
    activities_data: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'destinations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

// Associations moved to container.js

module.exports = Destination;
