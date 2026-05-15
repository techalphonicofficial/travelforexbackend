const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PipelineStage = sequelize.define('PipelineStage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pipeline_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: '#4f46e5' },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'crm_pipeline_stages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PipelineStage;
