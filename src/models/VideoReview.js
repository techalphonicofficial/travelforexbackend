const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const VideoReview = sequelize.define('VideoReview', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_handle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    video_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'video_reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = VideoReview;
