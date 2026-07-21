'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable('destinations');
    if (!columns.deleted_at) {
      await queryInterface.addColumn('destinations', 'deleted_at', {
        type: DataTypes.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('destinations');
    if (columns.deleted_at) {
      await queryInterface.removeColumn('destinations', 'deleted_at');
    }
  }
};
