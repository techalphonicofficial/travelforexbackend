const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageInclusion = sequelize.define('PackageInclusion', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    package_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: 'bi-check-circle' }
}, {
    tableName: 'package_inclusions',
    timestamps: false
});

module.exports = PackageInclusion;
