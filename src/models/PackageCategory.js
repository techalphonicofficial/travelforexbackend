const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageCategory = sequelize.define('PackageCategory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    feature_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    meta_title: {
        type: DataTypes.STRING,
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
    meta_schema: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    buttons: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'package_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (category) => {
            if (category.slug === '') {
                category.slug = null;
            }
            if (category.title && !category.slug) {
                category.slug = category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
        }
    }
});

module.exports = PackageCategory;
