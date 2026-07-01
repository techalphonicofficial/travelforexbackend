const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    reviewable_type: {
        type: DataTypes.ENUM('package', 'custom_booking', 'custom_package'),
        allowNull: false
    },
    reviewable_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    custom_trip_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    trip_inquiry_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reviewer_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reviewer_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    reviewer_phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'approved'
    },
    source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'api'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Review;
