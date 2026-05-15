'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'admin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'type');
  }
};
