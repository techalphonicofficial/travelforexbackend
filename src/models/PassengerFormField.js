const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PassengerFormField = sequelize.define('PassengerFormField', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    label: { type: DataTypes.STRING, allowNull: false },
    field_key: { type: DataTypes.STRING, allowNull: false, unique: true },
    field_type: {
        type: DataTypes.ENUM('text', 'number', 'select', 'date', 'textarea', 'checkbox', 'email', 'phone'),
        defaultValue: 'text'
    },
    options: { type: DataTypes.JSONB, defaultValue: [] },
    is_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'passenger_form_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PassengerFormField;
