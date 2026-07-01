'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');
    
    if (!tableDesc.feature_image) {
      await queryInterface.addColumn('destinations', 'feature_image', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!tableDesc.feature_image_alt) {
      await queryInterface.addColumn('destinations', 'feature_image_alt', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('destinations');

    if (tableDesc.feature_image) {
      await queryInterface.removeColumn('destinations', 'feature_image');
    }

    if (tableDesc.feature_image_alt) {
      await queryInterface.removeColumn('destinations', 'feature_image_alt');
    }
  }
};
