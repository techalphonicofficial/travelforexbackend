const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LeadFormField = sequelize.define('LeadFormField', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pipeline_id: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    field_key: { type: DataTypes.STRING, allowNull: false },
    field_type: {
        type: DataTypes.ENUM('text', 'number', 'select', 'date', 'textarea', 'checkbox', 'email', 'phone'),
        defaultValue: 'text'
    },
    options: { type: DataTypes.JSONB, defaultValue: [] },
    is_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'crm_lead_form_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LeadFormField;
