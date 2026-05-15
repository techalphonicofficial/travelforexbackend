'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crm_lead_form_fields', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      pipeline_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'crm_pipelines', key: 'id' },
        onDelete: 'CASCADE'
      },
      label: { type: Sequelize.STRING, allowNull: false },
      field_key: { type: Sequelize.STRING, allowNull: false },
      field_type: {
        type: Sequelize.ENUM('text', 'number', 'select', 'date', 'textarea', 'checkbox', 'email', 'phone'),
        defaultValue: 'text'
      },
      options: { type: Sequelize.JSONB, defaultValue: [] },
      is_required: { type: Sequelize.BOOLEAN, defaultValue: false },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('crm_lead_form_fields');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_crm_lead_form_fields_field_type";');
  }
};
