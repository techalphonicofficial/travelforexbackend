const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const LeadFollowUp = sequelize.define('LeadFollowUp', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lead_id: { type: DataTypes.INTEGER, allowNull: false },
    follow_up_date: { type: DataTypes.DATEONLY, allowNull: false },
    follow_up_time: { type: DataTypes.STRING },
    follow_up_type: {
        type: DataTypes.ENUM('call', 'email', 'meeting', 'whatsapp'),
        defaultValue: 'call'
    },
    notes: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.ENUM('pending', 'done', 'missed'),
        defaultValue: 'pending'
    },
    created_by: { type: DataTypes.UUID }
}, {
    tableName: 'crm_lead_follow_ups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LeadFollowUp;
