const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Customer = require('./Customer');

const ForexConversionRequest = sequelize.define('ForexConversionRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  from_currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  to_currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  conversion_rate: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  converted_amount: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  service_charge_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'percent'
  },
  service_charge_value: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  service_charge_amount: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'new'
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  journal_entry_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  converted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'forex_conversion_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ForexConversionRequest;
