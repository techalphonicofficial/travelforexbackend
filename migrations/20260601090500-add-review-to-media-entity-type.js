'use strict';

module.exports = {
  async up(queryInterface) {
    try {
      await queryInterface.sequelize.query('ALTER TYPE "enum_media_entity_type" ADD VALUE IF NOT EXISTS \'review\'');
    } catch (err) {
      console.log('Enum update failed (probably not Postgres or already exists):', err.message);
    }
  },

  async down() {
    // Removing a single value from a PostgreSQL ENUM requires recreating the type.
  }
};
