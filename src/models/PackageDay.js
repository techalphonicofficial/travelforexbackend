const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageDay = sequelize.define('PackageDay', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    package_destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'package_destinations', key: 'id' }
    },
    day_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'package_days',
    timestamps: false
});

// Relationships moved to container.js to avoid circular dependencies.

module.exports = PackageDay;
