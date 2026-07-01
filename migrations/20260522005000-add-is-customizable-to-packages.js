'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('packages');
    if (!tableInfo.is_customizable) {
      await queryInterface.addColumn('packages', 'is_customizable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('packages');
    if (tableInfo.is_customizable) {
      await queryInterface.removeColumn('packages', 'is_customizable');
    }
  }
};
