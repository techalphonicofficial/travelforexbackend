'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('destinations', 'meta_title', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('destinations', 'meta_description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('destinations', 'meta_title');
    await queryInterface.removeColumn('destinations', 'meta_description');
  }
};
