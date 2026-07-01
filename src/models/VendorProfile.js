const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const VendorProfile = sequelize.define('VendorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  legal_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  business_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gst_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pan_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address_line1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address_line2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'India'
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service_regions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  years_in_business: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  bank_account_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bank_account_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bank_ifsc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  terms_accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'vendor_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = VendorProfile;
