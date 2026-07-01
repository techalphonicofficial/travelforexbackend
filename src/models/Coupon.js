const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const normalizeCode = (value) => String(value || '').trim().toUpperCase();

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('code', normalizeCode(value));
    }
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'fixed'
  },
  discount_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  minimum_booking_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usage_limit_per_customer: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  applicable_scope: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'all'
  },
  applicable_package_ids: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  redemption_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Coupon;
