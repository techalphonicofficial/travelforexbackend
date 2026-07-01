'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('cancellation_rules')) return;

    await queryInterface.createTable('cancellation_rules', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      min_days_before_departure: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      max_days_before_departure: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      refund_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      cancellation_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addIndex('cancellation_rules', ['is_active']);
    await queryInterface.addIndex('cancellation_rules', ['min_days_before_departure', 'max_days_before_departure']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cancellation_rules');
  }
};
