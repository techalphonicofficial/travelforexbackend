'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');
    
    if (!tableDesc.title) {
      await queryInterface.addColumn('destinations', 'title', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');

    if (tableDesc.title) {
      await queryInterface.removeColumn('destinations', 'title');
    }
  }
};
