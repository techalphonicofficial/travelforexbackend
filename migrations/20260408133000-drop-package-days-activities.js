'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop tables in reverse structure order
    await queryInterface.dropTable('package_activities');
    await queryInterface.dropTable('package_days');
  },

  async down(queryInterface, Sequelize) {
    // Recreating these tables is complex and depends on the specific schema version.
    // For local development and this refactor, we assume this is a one-way simplification.
    // Basic recreation if needed:
    await queryInterface.createTable('package_days', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'package_destinations', key: 'id' },
        onDelete: 'CASCADE'
      },
      day_number: { type: Sequelize.INTEGER, allowNull: false }
    });

    await queryInterface.createTable('package_activities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_day_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'package_days', key: 'id' },
        onDelete: 'CASCADE'
      },
      time_slot: { type: Sequelize.STRING(50), defaultValue: 'Full Day' },
      title: { type: Sequelize.STRING(255), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 }
    });
  }
};
