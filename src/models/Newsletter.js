const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(80),
    allowNull: false,
    defaultValue: 'website'
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'subscribed'
  },
  subscribed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'newsletters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Newsletter;
