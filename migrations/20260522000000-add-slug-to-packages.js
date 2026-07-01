'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('packages');
    if (!tableInfo.slug) {
      await queryInterface.addColumn('packages', 'slug', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('packages');
    if (tableInfo.slug) {
      await queryInterface.removeColumn('packages', 'slug');
    }
  }
};
