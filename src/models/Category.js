const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'e.g. Adventure, Family, Honeymoon'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tag_color: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'gray'
    },
    show_in_menu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    show_in_sidebar: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    show_in_home: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    is_customizable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    is_tour_type: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    feature_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    feature_image_alt: {
        type: DataTypes.STRING,
        allowNull: true
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
    schema: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: (category) => {
            if (category.slug === '') {
                category.slug = null;
            }
            if (category.name && !category.slug) {
                category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
        }
    }
});

module.exports = Category;
