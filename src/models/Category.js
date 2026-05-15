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
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Category;
