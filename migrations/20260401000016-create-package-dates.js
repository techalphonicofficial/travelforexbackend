'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('package_dates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'soldout'),
        defaultValue: 'active'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('package_dates');
    // Drop ENUM type for PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_package_dates_status";');
  }
};
