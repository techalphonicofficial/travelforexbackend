const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const TripJackCityRegion = sequelize.define('TripJackCityRegion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cityRegionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    cityName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    regionName: DataTypes.STRING,
    countryName: DataTypes.STRING,
    regionType: DataTypes.STRING,
    fullRegionName: DataTypes.STRING
}, {
    tableName: 'tripjack_city_regions',
    timestamps: true
});

module.exports = TripJackCityRegion;