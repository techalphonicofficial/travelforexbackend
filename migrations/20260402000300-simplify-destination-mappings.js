'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove redundant columns from destination_mappings
    await queryInterface.removeColumn('destination_mappings', 'continent_id');
    await queryInterface.removeColumn('destination_mappings', 'country_id');
  },

  async down(queryInterface, Sequelize) {
    // Re-add columns for rollback
    await queryInterface.addColumn('destination_mappings', 'continent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'continents', key: 'id' }
    });
    await queryInterface.addColumn('destination_mappings', 'country_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'countries', key: 'id' }
    });
  }
};
