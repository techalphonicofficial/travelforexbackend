'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSql requires explicit ALTER TYPE for enums
    // We wrap in try-catch because if it's not Postgres (e.g. SQLite), it might fail or behave differently
    try {
      await queryInterface.sequelize.query('ALTER TYPE "enum_media_entity_type" ADD VALUE IF NOT EXISTS \'page\'');
      await queryInterface.sequelize.query('ALTER TYPE "enum_media_entity_type" ADD VALUE IF NOT EXISTS \'banner\'');
      await queryInterface.sequelize.query('ALTER TYPE "enum_media_entity_type" ADD VALUE IF NOT EXISTS \'blog_post\'');
    } catch (err) {
      console.log('Enum update failed (probably not Postgres or already exists):', err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Removing values from ENUM is not supported in Postgres without recreating the type
  }
};
