'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('categories');

    if (!tableInfo.is_tour_type) {
      await queryInterface.addColumn('categories', 'is_tour_type', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE categories
      SET is_tour_type = true
      WHERE LOWER(slug) IN ('beach', 'adventure', 'cultural', 'luxury', 'safari', 'honeymoon')
         OR LOWER(name) IN ('beach', 'adventure', 'cultural', 'luxury', 'safari', 'honeymoon')
    `);
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('categories');
    if (tableInfo.is_tour_type) {
      await queryInterface.removeColumn('categories', 'is_tour_type');
    }
  }
};
