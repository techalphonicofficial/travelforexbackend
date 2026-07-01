const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const CouponRedemption = sequelize.define('CouponRedemption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'package_bookings',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  customer_email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  coupon_code: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  booking_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  redeemed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'coupon_redemptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CouponRedemption;
