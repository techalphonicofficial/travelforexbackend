'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('passenger_form_fields', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      field_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      field_type: {
        type: Sequelize.ENUM('text', 'number', 'select', 'date', 'textarea', 'checkbox', 'email', 'phone'),
        defaultValue: 'text'
      },
      options: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('passenger_form_fields');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_passenger_form_fields_field_type" CASCADE;');
  }
};
