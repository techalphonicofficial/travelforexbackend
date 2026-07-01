'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');
    
    if (!tableDesc.customize) {
      await queryInterface.addColumn('destinations', 'customize', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');

    if (tableDesc.customize) {
      await queryInterface.removeColumn('destinations', 'customize');
    }
  }
};
