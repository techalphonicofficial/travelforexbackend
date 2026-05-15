'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column exists first to avoid errors
    const tableDescInclusions = await queryInterface.describeTable('package_inclusions');
    if (!tableDescInclusions.icon) {
      await queryInterface.addColumn('package_inclusions', 'icon', {
        type: Sequelize.STRING,
        defaultValue: 'bi-check-circle'
      });
    }

    const tableDescExclusions = await queryInterface.describeTable('package_exclusions');
    if (!tableDescExclusions.icon) {
      await queryInterface.addColumn('package_exclusions', 'icon', {
        type: Sequelize.STRING,
        defaultValue: 'bi-x-circle'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('package_inclusions', 'icon');
    await queryInterface.removeColumn('package_exclusions', 'icon');
  }
};
