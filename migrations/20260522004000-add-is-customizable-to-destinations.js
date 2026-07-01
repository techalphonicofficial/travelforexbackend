'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('destinations');
    if (!tableInfo.is_customizable) {
      await queryInterface.addColumn('destinations', 'is_customizable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (tableInfo.customize) {
      await queryInterface.sequelize.query(`
        UPDATE destinations
        SET is_customizable = COALESCE(customize, false)
        WHERE is_customizable = false
      `);
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('destinations');
    if (tableInfo.is_customizable) {
      await queryInterface.removeColumn('destinations', 'is_customizable');
    }
  }
};
