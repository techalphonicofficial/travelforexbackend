'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query('ALTER TYPE "enum_blog_posts_status" ADD VALUE IF NOT EXISTS \'active\'');
      await queryInterface.sequelize.query('ALTER TYPE "enum_blog_posts_status" ADD VALUE IF NOT EXISTS \'inactive\'');
    } catch (err) {

    }
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL enum values cannot be removed safely without recreating the type.
  }
};
