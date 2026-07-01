'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const hotelColumns = await queryInterface.describeTable('hotels');
    if (!hotelColumns.commission_percent) {
      await queryInterface.addColumn('hotels', 'commission_percent', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }

    const tables = await queryInterface.showAllTables();
    if (tables.includes('hotel_bookings')) return;

    await queryInterface.createTable('hotel_bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      hotel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'hotels', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'destinations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      room_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      rooms: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      check_in: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      check_out: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      total_travellers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      base_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      commission_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      commission_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
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
      raw_payload: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('hotel_bookings', ['user_id']);
    await queryInterface.addIndex('hotel_bookings', ['hotel_id']);
    await queryInterface.addIndex('hotel_bookings', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('hotel_bookings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_hotel_bookings_status";');

    const hotelColumns = await queryInterface.describeTable('hotels');
    if (hotelColumns.commission_percent) {
      await queryInterface.removeColumn('hotels', 'commission_percent');
    }
  }
};
