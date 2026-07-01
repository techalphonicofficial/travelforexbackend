const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    entity_type: {
        type: DataTypes.ENUM('destination', 'package', 'hotel', 'category', 'package_day', 'page', 'banner', 'review'),
        allowNull: false
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alt_text: DataTypes.STRING,
    media_type: {
        type: DataTypes.ENUM('image', 'video'),
        defaultValue: 'image'
    },
    key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    label: {
        type: DataTypes.STRING,
        allowNull: true
    },
    poster_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Media;
