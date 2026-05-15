const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    cta_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    cta_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    image_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    video_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    position: {
        type: DataTypes.ENUM('top', 'middle', 'sidebar', 'footer'),
        defaultValue: 'top'
    },
    device: {
        type: DataTypes.ENUM('all', 'desktop', 'mobile'),
        defaultValue: 'all'
    },
    page_type: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    page_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.SMALLINT,
        defaultValue: 1
    }
}, {
    tableName: 'banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Banner;
