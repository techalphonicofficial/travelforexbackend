const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageCategoryMapping = sequelize.define('PackageCategoryMapping', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    package_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'package_category_mappings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PackageCategoryMapping;
