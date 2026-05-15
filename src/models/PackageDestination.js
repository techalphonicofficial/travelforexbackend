const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PackageDestination = sequelize.define('PackageDestination', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'packages', key: 'id' }
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' }
    },
    nights: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
       activities: {
      type: DataTypes.JSONB,   // 🔥 PostgreSQL JSONB
      allowNull: true,
      defaultValue: {},
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'package_destinations',
    timestamps: false
});

// Relationships moved to container.js to avoid circular dependencies.

module.exports = PackageDestination;
