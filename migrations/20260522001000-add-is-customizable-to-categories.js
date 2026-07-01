'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('categories');
    if (!tableInfo.is_customizable) {
      await queryInterface.addColumn('categories', 'is_customizable', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('categories');
    if (tableInfo.is_customizable) {
      await queryInterface.removeColumn('categories', 'is_customizable');
    }
  }
};
