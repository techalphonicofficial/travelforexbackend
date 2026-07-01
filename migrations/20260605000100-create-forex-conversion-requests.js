'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('forex_conversion_requests')) return;

    await queryInterface.createTable('forex_conversion_requests', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      from_currency: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      to_currency: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      conversion_rate: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      converted_amount: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      service_charge_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'percent'
      },
      service_charge_value: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      service_charge_amount: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'new'
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'crm_leads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      journal_entry_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'journal_entries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      converted_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('forex_conversion_requests', ['customer_id'], { name: 'forex_conversion_requests_customer_id_idx' });
    await queryInterface.addIndex('forex_conversion_requests', ['status'], { name: 'forex_conversion_requests_status_idx' });
    await queryInterface.addIndex('forex_conversion_requests', ['lead_id'], { name: 'forex_conversion_requests_lead_id_idx' });
    await queryInterface.addIndex('forex_conversion_requests', ['created_at'], { name: 'forex_conversion_requests_created_at_idx' });
    await queryInterface.addIndex('forex_conversion_requests', ['from_currency', 'to_currency'], { name: 'forex_conversion_requests_currency_pair_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forex_conversion_requests');
  }
};
