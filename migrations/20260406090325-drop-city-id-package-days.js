'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('package_days', 'city_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_days', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'cities', key: 'id' }
    });
  }
};
