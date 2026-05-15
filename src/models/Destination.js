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
    }
}, {
    tableName: 'destinations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations moved to container.js

module.exports = Destination;
