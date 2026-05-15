'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding 'package_day' to the ENUM for media entity_type
    // Note: Changing ENUMs in some DBs (like Postgres) requires specific steps,
    // but assuming simple alter or replace for this setup.
    await queryInterface.changeColumn('media', 'entity_type', {
      type: Sequelize.ENUM('destination', 'package', 'hotel', 'category', 'package_day'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('media', 'entity_type', {
      type: Sequelize.ENUM('destination', 'package', 'hotel', 'category'),
      allowNull: false
    });
  }
};
