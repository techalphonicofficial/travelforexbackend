const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const HotelBooking = sequelize.define('HotelBooking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' }
    },
    hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'hotels', key: 'id' }
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' }
    },
    room_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    rooms: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    check_in: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    check_out: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    total_travellers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    base_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    commission_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    commission_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('new', 'contacted', 'quoted', 'converted', 'cancelled'),
        allowNull: false,
        defaultValue: 'new'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    raw_payload: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'hotel_bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = HotelBooking;
