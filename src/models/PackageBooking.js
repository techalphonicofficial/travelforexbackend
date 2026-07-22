const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageBooking = sequelize.define('PackageBooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_reference: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'packages',
      key: 'id'
    }
  },
  package_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  package_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
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
  from_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  to_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  departure_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  package_base_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  hotel_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tax_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  package_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  remaining_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  coupon_code: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  coupon_discount_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  coupon_snapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  vendor_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  platform_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  vendor_split_basis: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  partial_booking_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  partial_booking_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  payment_status: {
    type: DataTypes.STRING(80),
    allowNull: false,
    defaultValue: 'pending'
  },
  razorpay_order_id: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true
  },
  payment_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  accounting_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  accounting_entry_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'journal_entries',
      key: 'id'
    }
  },
  page_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  raw_payload: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'package_bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PackageBooking;
