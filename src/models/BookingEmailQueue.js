const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const BookingEmailQueue = sequelize.define('BookingEmailQueue', {
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
  booking_reference: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  email_type: {
    type: DataTypes.STRING(60),
    allowNull: false,
    defaultValue: 'package_itinerary'
  },
  recipient_email: {
    type: DataTypes.STRING(180),
    allowNull: false
  },
  recipient_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  html_body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  text_body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending'
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  last_attempt_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  provider_response: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'booking_email_queue',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = BookingEmailQueue;
