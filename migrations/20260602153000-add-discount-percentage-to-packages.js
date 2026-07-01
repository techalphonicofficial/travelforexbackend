'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('packages');

    if (!tableInfo.discount_percentage) {
      await queryInterface.addColumn('packages', 'discount_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('packages');

    if (tableInfo.discount_percentage) {
      await queryInterface.removeColumn('packages', 'discount_percentage');
    }
  }
};
