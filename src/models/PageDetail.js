const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PageDetail = sequelize.define('PageDetail', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    page_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    key: {
        type: DataTypes.STRING(100),
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
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    json_data: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'page_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PageDetail;
