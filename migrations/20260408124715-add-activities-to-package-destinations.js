'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_destinations', 'activities', {
      type: Sequelize.JSONB,
      defaultValue: {},
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('package_destinations', 'activities');
  }
};