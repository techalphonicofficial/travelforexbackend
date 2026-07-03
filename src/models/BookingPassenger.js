const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const BookingPassenger = sequelize.define('BookingPassenger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'package_bookings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  passport_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  passport_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  custom_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  is_lead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'booking_passengers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = BookingPassenger;
