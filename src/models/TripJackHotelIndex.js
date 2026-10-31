const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/* Supplier hotel names for the hotel search box (see tripJackHotelIndexService) */
const TripJackHotelIndex = sequelize.define('TripJackHotelIndex', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tjHotelId: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cityName: DataTypes.STRING,
    stateName: DataTypes.STRING,
    countryName: DataTypes.STRING,
    cityRegionId: DataTypes.BIGINT,
    starRating: DataTypes.FLOAT,
    propertyType: DataTypes.STRING
}, {
    tableName: 'tripjack_hotel_index',
    timestamps: true
});

module.exports = TripJackHotelIndex;
