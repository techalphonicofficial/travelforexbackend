const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
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
    feature_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    alt_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    keyword: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    schema: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'pages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Page;
