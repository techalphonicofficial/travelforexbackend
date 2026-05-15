'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crm_lead_follow_ups', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      lead_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'crm_leads', key: 'id' },
        onDelete: 'CASCADE'
      },
      follow_up_date: { type: Sequelize.DATEONLY, allowNull: false },
      follow_up_time: { type: Sequelize.STRING },
      follow_up_type: {
        type: Sequelize.ENUM('call', 'email', 'meeting', 'whatsapp'),
        defaultValue: 'call'
      },
      notes: { type: Sequelize.TEXT },
      status: {
        type: Sequelize.ENUM('pending', 'done', 'missed'),
        defaultValue: 'pending'
      },
      created_by: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('crm_lead_follow_ups');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_crm_lead_follow_ups_follow_up_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_crm_lead_follow_ups_status";');
  }
};
