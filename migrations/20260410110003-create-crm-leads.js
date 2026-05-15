'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crm_leads', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      source: { type: Sequelize.STRING, defaultValue: 'Website' },
      pipeline_id: {
        type: Sequelize.INTEGER,
        references: { model: 'crm_pipelines', key: 'id' },
        onDelete: 'SET NULL'
      },
      stage_id: {
        type: Sequelize.INTEGER,
        references: { model: 'crm_pipeline_stages', key: 'id' },
        onDelete: 'SET NULL'
      },
      assigned_to: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      custom_fields: { type: Sequelize.JSONB, defaultValue: {} },
      notes: { type: Sequelize.TEXT },
      status: {
        type: Sequelize.ENUM('active', 'won', 'lost'),
        defaultValue: 'active'
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('crm_leads');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_crm_leads_status";');
  }
};
