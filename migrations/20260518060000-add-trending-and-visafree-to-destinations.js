'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns already exist to avoid errors
    const tableDesc = await queryInterface.describeTable('destinations');
    
    if (!tableDesc.is_trending) {
      await queryInterface.addColumn('destinations', 'is_trending', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!tableDesc.is_visa_free) {
      await queryInterface.addColumn('destinations', 'is_visa_free', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');

    if (tableDesc.is_trending) {
      await queryInterface.removeColumn('destinations', 'is_trending');
    }

    if (tableDesc.is_visa_free) {
      await queryInterface.removeColumn('destinations', 'is_visa_free');
    }
  }
};
