'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      entity_type: {
        type: Sequelize.ENUM('destination', 'package', 'hotel', 'category'),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add region_type to packages
    await queryInterface.addColumn('packages', 'region_type', {
      type: Sequelize.ENUM('domestic', 'international'),
      defaultValue: 'domestic'
    });

    // Create Package Inclusions
    await queryInterface.createTable('package_inclusions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: Sequelize.STRING, allowNull: false },
      icon: { type: Sequelize.STRING, defaultValue: 'bi-check-circle' }
    });

    // Create Package Exclusions
    await queryInterface.createTable('package_exclusions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: Sequelize.STRING, allowNull: false },
      icon: { type: Sequelize.STRING, defaultValue: 'bi-x-circle' }
    });

    // Package Stays mapping with Nights
    await queryInterface.createTable('package_destination_mappings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      package_id: { type: Sequelize.INTEGER, references: { model: 'packages', key: 'id' }, onDelete: 'CASCADE' },
      destination_id: { type: Sequelize.INTEGER, references: { model: 'destinations', key: 'id' }, onDelete: 'CASCADE' },
      nights: { type: Sequelize.INTEGER, defaultValue: 1 },
      order: { type: Sequelize.INTEGER, defaultValue: 1 }
    });

    // Detailed Pricing for Dates
    await queryInterface.addColumn('package_dates', 'adult_price', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addColumn('package_dates', 'child_with_bed', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addColumn('package_dates', 'child_without_bed', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addColumn('package_dates', 'infant_price', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addColumn('package_dates', 'single_occupancy_extra', { type: Sequelize.DECIMAL(10, 2), allowNull: true });

    // Copy old price to adult_price for existing dates
    await queryInterface.sequelize.query('UPDATE package_dates SET adult_price = price');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media');
    await queryInterface.removeColumn('packages', 'region_type');
    await queryInterface.dropTable('package_inclusions');
    await queryInterface.dropTable('package_exclusions');
    await queryInterface.dropTable('package_destination_mappings');
    await queryInterface.removeColumn('package_dates', 'adult_price');
    await queryInterface.removeColumn('package_dates', 'child_with_bed');
    await queryInterface.removeColumn('package_dates', 'child_without_bed');
    await queryInterface.removeColumn('package_dates', 'infant_price');
    await queryInterface.removeColumn('package_dates', 'single_occupancy_extra');
  }
};
