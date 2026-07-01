const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DestinationCrowdLevel = sequelize.define('DestinationCrowdLevel', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    level: {
        type: DataTypes.ENUM('low', 'high'),
        allowNull: false
    }
}, {
    tableName: 'destination_crowd_levels',
    timestamps: false
});

module.exports = DestinationCrowdLevel;
