const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Pipeline = sequelize.define('Pipeline', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'crm_pipelines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Pipeline;
