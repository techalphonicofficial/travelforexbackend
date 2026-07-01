const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const TripInquiry = sequelize.define('TripInquiry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    // Customer info (snapshot at time of inquiry)
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' }
    },
    customer_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    customer_email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    customer_phone: {
        type: DataTypes.STRING(30),
        allowNull: true
    },

    // Trip basics
    destination: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    destination_slug: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' }
    },
    travel_with: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'e.g. Luxury, Budget, Family'
    },
    duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g. 7-8 Days'
    },
    departure_city: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    departure_date: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    total_travellers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },

    // Rooms & cities stored as JSON
    rooms: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    },
    cities: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    },

    // Source of inquiry
    source: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'customize_flow'
    },

    // Tax info fetched from destination
    tax_rule_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'domestic / international_outbound / exempt'
    },
    gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    tcs_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
    },

    // Price fields (filled later by agent)
    base_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    gst_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    tcs_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
    },

    // Full raw payload for reference
    raw_payload: {
        type: DataTypes.JSONB,
        allowNull: true
    },

    // Status
    status: {
        type: DataTypes.ENUM('new', 'contacted', 'quoted', 'converted', 'cancelled'),
        allowNull: false,
        defaultValue: 'new'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'trip_inquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TripInquiry;
