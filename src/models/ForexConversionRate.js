const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ForexConversionRate = sequelize.define('ForexConversionRate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  base_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'INR'
  },
  conversion_rate: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    defaultValue: 0.000000
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'forex_conversion_rates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ForexConversionRate;
