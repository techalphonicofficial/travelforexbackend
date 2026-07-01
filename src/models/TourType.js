const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const TourType = sequelize.define('TourType', {
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
        unique: true,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    image_alt: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meta_keyword: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meta_schema: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'tour_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TourType;
