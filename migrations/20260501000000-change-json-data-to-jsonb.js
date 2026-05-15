'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change column type to JSONB. Using USING to cast existing text to jsonb
    await queryInterface.changeColumn('page_details', 'json_data', {
      type: 'JSONB USING CAST("json_data" as JSONB)',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('page_details', 'json_data', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
