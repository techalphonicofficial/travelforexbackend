'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('forex_conversion_rates')) return;

    await queryInterface.createTable('forex_conversion_rates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'countries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      base_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INR'
      },
      conversion_rate: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0.000000
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notes: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    await queryInterface.addIndex('forex_conversion_rates', ['country_id'], { name: 'forex_conversion_rates_country_id_idx' });
    await queryInterface.addIndex('forex_conversion_rates', ['code'], { name: 'forex_conversion_rates_code_idx' });
    await queryInterface.addIndex('forex_conversion_rates', ['is_active'], { name: 'forex_conversion_rates_is_active_idx' });
    await queryInterface.addIndex('forex_conversion_rates', ['country_id', 'code', 'base_code'], {
      unique: true,
      name: 'forex_conversion_rates_country_code_base_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forex_conversion_rates');
  }
};
