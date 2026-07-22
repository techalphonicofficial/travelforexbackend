const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Hotel = sequelize.define('Hotel', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' }
    },
    city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'cities', key: 'id' }
    },
    star_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: { min: 1, max: 5 }
    },
    price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_rooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    guest_rating: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 0.0,
        validate: { min: 0, max: 5 }
    },
    amenities: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: { min: 0, max: 100 }
    },
    commission_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: { min: 0, max: 100 }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    source_type: {
        type: DataTypes.ENUM('manual', 'third_party'),
        allowNull: false,
        defaultValue: 'manual'
    },
    provider_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    }
}, {
    tableName: 'hotels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Hotel;
