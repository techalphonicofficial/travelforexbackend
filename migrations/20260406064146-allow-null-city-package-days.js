'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('package_days', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'cities', key: 'id' }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('package_days', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'cities', key: 'id' }
    });
  }
};
