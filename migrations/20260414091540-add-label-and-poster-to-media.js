'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('media', 'label', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('media', 'poster_url', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('media', 'label');
    await queryInterface.removeColumn('media', 'poster_url');
  }
};
