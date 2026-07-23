const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageHighlight = sequelize.define('PackageHighlight', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    package_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
    tableName: 'package_highlights',
    timestamps: false
});

module.exports = PackageHighlight;
