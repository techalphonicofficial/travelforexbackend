'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('destinations', 'meta_keyword', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('destinations', 'schema', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('destinations', 'meta_keyword');
    await queryInterface.removeColumn('destinations', 'schema');
  }
};
