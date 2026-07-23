'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('destinations');

    if (!table.visa_category) {
      await queryInterface.addColumn('destinations', 'visa_category', {
        type: Sequelize.STRING(40),
        allowNull: true
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE "destinations"
      SET "visa_category" = 'visa_free_on_arrival'
      WHERE "is_visa_free" = true
        AND "visa_category" IS NULL
    `);
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('destinations');
    if (table.visa_category) {
      await queryInterface.removeColumn('destinations', 'visa_category');
    }
  }
};
