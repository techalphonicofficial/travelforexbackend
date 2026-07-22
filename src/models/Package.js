const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const PackageInclusion = require('./PackageInclusion');
const PackageExclusion = require('./PackageExclusion');
const PackageDestination = require('./PackageDestination');

const Package = sequelize.define('Package', {
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
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    travel_type: {
        type: DataTypes.ENUM('domestic', 'international'),
        allowNull: false,
        defaultValue: 'domestic',
        validate: {
            isIn: [['domestic', 'international']]
        }
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    departure_city: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    tax_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tax_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    show_in_home_page: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    is_customizable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
    meta_keyword: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    schema: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    vendor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    main_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    main_image_alt: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'packages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Relationships moved to container.js to avoid circular dependencies.

module.exports = Package;
