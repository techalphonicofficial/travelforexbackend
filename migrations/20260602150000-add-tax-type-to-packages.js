'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('packages');

    if (!tableInfo.tax_type) {
      await queryInterface.addColumn('packages', 'tax_type', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!tableInfo.tax_percent) {
      await queryInterface.addColumn('packages', 'tax_percent', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('packages');

    if (tableInfo.tax_percent) {
      await queryInterface.removeColumn('packages', 'tax_percent');
    }

    if (tableInfo.tax_type) {
      await queryInterface.removeColumn('packages', 'tax_type');
    }
  }
};
