const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = sequelize.define('RolePermission', {
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: 'id'
        }
    },
    permission_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Permission,
            key: 'id'
        }
    }
}, {
    tableName: 'role_permissions',
    timestamps: false
});

// Associations for many-to-many
// Associations moved to container.js

module.exports = RolePermission;
