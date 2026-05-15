'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('categories', 'show_in_home', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('categories', 'show_in_home');

  }
};