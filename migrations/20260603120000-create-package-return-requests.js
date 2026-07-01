'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('package_return_requests')) return;

    await queryInterface.createTable('package_return_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'package_bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      booking_reference: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      requested_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
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
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'pending'
      },
      departure_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      requested_refund_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      requested_cancel_remaining_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancellation_rule_snapshot: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      settlement_snapshot: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      accounting_entry_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'journal_entries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rejected_at: {
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

    await queryInterface.addIndex('package_return_requests', ['booking_id']);
    await queryInterface.addIndex('package_return_requests', ['customer_id']);
    await queryInterface.addIndex('package_return_requests', ['requested_by_user_id']);
    await queryInterface.addIndex('package_return_requests', ['status']);
    await queryInterface.addIndex('package_return_requests', ['created_at']);
    await queryInterface.addIndex('package_return_requests', ['booking_id'], {
      unique: true,
      where: { status: 'pending' },
      name: 'package_return_requests_pending_booking_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('package_return_requests');
  }
};
