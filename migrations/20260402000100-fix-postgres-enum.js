'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding 'package_day' to the ENUM for media entity_type specifically for Postgres
    // Postgres requires 'ALTER TYPE' for enums
    try {
      await queryInterface.sequelize.query('ALTER TYPE "enum_media_entity_type" ADD VALUE \'package_day\'');
    } catch (err) {
      // If it already exists, ignore (Postgres doesn't have IF NOT EXISTS for ADD VALUE before v12, but catching error is safer)
      console.log('ENUM value might already exist or error occurred:', err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: Removing an ENUM value in Postgres is complex (requires dropping/recreating type).
    // Usually, we lean towards leaving it in down migrations for enums.
  }
};
