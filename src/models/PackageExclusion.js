const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageExclusion = sequelize.define('PackageExclusion', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    package_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: 'bi-x-circle' }
}, {
    tableName: 'package_exclusions',
    timestamps: false
});

module.exports = PackageExclusion;
