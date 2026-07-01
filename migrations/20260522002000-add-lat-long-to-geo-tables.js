'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ['continents', 'countries', 'cities'];

    for (const table of tables) {
      const tableInfo = await queryInterface.describeTable(table);

      if (!tableInfo.latitude) {
        await queryInterface.addColumn(table, 'latitude', {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: true
        });
      }

      if (!tableInfo.longitude) {
        await queryInterface.addColumn(table, 'longitude', {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: true
        });
      }
    }
  },

  async down(queryInterface) {
    const tables = ['cities', 'countries', 'continents'];

    for (const table of tables) {
      const tableInfo = await queryInterface.describeTable(table);

      if (tableInfo.longitude) {
        await queryInterface.removeColumn(table, 'longitude');
      }

      if (tableInfo.latitude) {
        await queryInterface.removeColumn(table, 'latitude');
      }
    }
  }
};
