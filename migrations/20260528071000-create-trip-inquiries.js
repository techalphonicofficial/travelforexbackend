'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('trip_inquiries')) {
      return;
    }

    await queryInterface.createTable('trip_inquiries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      customer_name: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      customer_email: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      customer_phone: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      destination: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      destination_slug: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      travel_with: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      duration: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      departure_city: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      departure_date: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      total_travellers: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      rooms: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      cities: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'customize_flow'
      },
      tax_rule_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      gst_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      tcs_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      base_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      gst_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      tcs_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      raw_payload: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('new', 'contacted', 'quoted', 'converted', 'cancelled'),
        allowNull: false,
        defaultValue: 'new'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('trip_inquiries');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trip_inquiries_status";');
  }
};
