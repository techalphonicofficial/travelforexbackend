'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('categories');
    
    if (!tableDesc.feature_image) await queryInterface.addColumn('categories', 'feature_image', { type: Sequelize.STRING, allowNull: true });
    if (!tableDesc.feature_image_alt) await queryInterface.addColumn('categories', 'feature_image_alt', { type: Sequelize.STRING, allowNull: true });
    if (!tableDesc.meta_title) await queryInterface.addColumn('categories', 'meta_title', { type: Sequelize.STRING, allowNull: true });
    if (!tableDesc.meta_description) await queryInterface.addColumn('categories', 'meta_description', { type: Sequelize.TEXT, allowNull: true });
    if (!tableDesc.meta_keyword) await queryInterface.addColumn('categories', 'meta_keyword', { type: Sequelize.TEXT, allowNull: true });
    if (!tableDesc.schema) await queryInterface.addColumn('categories', 'schema', { type: Sequelize.TEXT, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('categories');

    if (tableDesc.feature_image) await queryInterface.removeColumn('categories', 'feature_image');
    if (tableDesc.feature_image_alt) await queryInterface.removeColumn('categories', 'feature_image_alt');
    if (tableDesc.meta_title) await queryInterface.removeColumn('categories', 'meta_title');
    if (tableDesc.meta_description) await queryInterface.removeColumn('categories', 'meta_description');
    if (tableDesc.meta_keyword) await queryInterface.removeColumn('categories', 'meta_keyword');
    if (tableDesc.schema) await queryInterface.removeColumn('categories', 'schema');
  }
};
