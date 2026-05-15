const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    source: { type: DataTypes.STRING, defaultValue: 'Website' },
    pipeline_id: { type: DataTypes.INTEGER },
    stage_id: { type: DataTypes.INTEGER },
    assigned_to: { type: DataTypes.UUID },
    customer_id: { type: DataTypes.UUID },
    custom_fields: { type: DataTypes.JSONB, defaultValue: {} },
    notes: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.ENUM('active', 'won', 'lost'),
        defaultValue: 'active'
    }
}, {
    tableName: 'crm_leads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Lead;
