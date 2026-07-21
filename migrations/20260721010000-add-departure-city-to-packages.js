'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable('packages');
    if (!columns.departure_city) {
      await queryInterface.addColumn('packages', 'departure_city', {
        type: DataTypes.STRING(150),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('packages');
    if (columns.departure_city) {
      await queryInterface.removeColumn('packages', 'departure_city');
    }
  }
};
