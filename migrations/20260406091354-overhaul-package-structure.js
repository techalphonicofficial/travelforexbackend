'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop existing tables in reverse dependency order
    await queryInterface.dropTable('package_items');
    await queryInterface.dropTable('package_days');
    await queryInterface.dropTable('package_destination_mappings');
    await queryInterface.dropTable('package_inclusions');
    await queryInterface.dropTable('package_exclusions');
    await queryInterface.dropTable('package_dates'); // Just in case
    await queryInterface.dropTable('packages');

    // 2. Create 'packages' table
    await queryInterface.createTable('packages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      duration_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      region_type: { type: Sequelize.ENUM('domestic', 'international'), defaultValue: 'domestic' },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. Create 'package_destinations'
    await queryInterface.createTable('package_destinations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'packages', key: 'id' },
        onDelete: 'CASCADE'
      },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onDelete: 'CASCADE'
      },
      nights: { type: Sequelize.INTEGER, defaultValue: 1 },
      order: { type: Sequelize.INTEGER, defaultValue: 1 }
    });

    // 4. Create 'package_days'
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

    // 5. Create 'package_activities'
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

    // 6. Create Meta Tables (Inclusions/Exclusions)
    await queryInterface.createTable('package_inclusions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: Sequelize.TEXT, allowNull: false }
    });
    await queryInterface.createTable('package_exclusions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: Sequelize.TEXT, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverting this complex change is best done by a fresh migration if needed, 
    // but for completeness we drop everything in reverse.
    await queryInterface.dropTable('package_exclusions');
    await queryInterface.dropTable('package_inclusions');
    await queryInterface.dropTable('package_activities');
    await queryInterface.dropTable('package_days');
    await queryInterface.dropTable('package_destinations');
    await queryInterface.dropTable('packages');
  }
};
