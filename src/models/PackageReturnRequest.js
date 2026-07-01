const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageReturnRequest = sequelize.define('PackageReturnRequest', {
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
    }
  },
  booking_reference: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  requested_by_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
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
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending'
  },
  departure_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  requested_refund_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  requested_cancel_remaining_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_rule_snapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  settlement_snapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  accounting_entry_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'journal_entries',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejected_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'package_return_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PackageReturnRequest;
