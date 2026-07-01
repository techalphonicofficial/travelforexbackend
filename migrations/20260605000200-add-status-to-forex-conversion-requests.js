'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('forex_conversion_requests')) return;

    const columns = await queryInterface.describeTable('forex_conversion_requests');
    if (!columns.status) {
      await queryInterface.addColumn('forex_conversion_requests', 'status', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'new'
      });
    }
    if (!columns.lead_id) {
      await queryInterface.addColumn('forex_conversion_requests', 'lead_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'crm_leads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
    if (!columns.journal_entry_id) {
      await queryInterface.addColumn('forex_conversion_requests', 'journal_entry_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'journal_entries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
    if (!columns.converted_at) {
      await queryInterface.addColumn('forex_conversion_requests', 'converted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    const indexes = await queryInterface.showIndex('forex_conversion_requests');
    const names = new Set(indexes.map(index => index.name));
    if (!names.has('forex_conversion_requests_status_idx')) {
      await queryInterface.addIndex('forex_conversion_requests', ['status'], { name: 'forex_conversion_requests_status_idx' });
    }
    if (!names.has('forex_conversion_requests_lead_id_idx')) {
      await queryInterface.addIndex('forex_conversion_requests', ['lead_id'], { name: 'forex_conversion_requests_lead_id_idx' });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('forex_conversion_requests')) return;

    const columns = await queryInterface.describeTable('forex_conversion_requests');
    if (columns.converted_at) await queryInterface.removeColumn('forex_conversion_requests', 'converted_at');
    if (columns.journal_entry_id) await queryInterface.removeColumn('forex_conversion_requests', 'journal_entry_id');
    if (columns.lead_id) await queryInterface.removeColumn('forex_conversion_requests', 'lead_id');
    if (columns.status) await queryInterface.removeColumn('forex_conversion_requests', 'status');
  }
};
