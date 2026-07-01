'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('package_bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      booking_reference: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'packages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      package_slug: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      package_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      vendor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      package_base_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tax_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      package_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      paid_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      remaining_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      vendor_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      platform_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      vendor_split_basis: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      partial_booking_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      partial_booking_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      payment_status: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'pending'
      },
      razorpay_order_id: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      razorpay_payment_id: {
        type: Sequelize.STRING(120),
        allowNull: true,
        unique: true
      },
      payment_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      accounting_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
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
      page_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      raw_payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
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

    await queryInterface.addIndex('package_bookings', ['package_id']);
    await queryInterface.addIndex('package_bookings', ['vendor_id']);
    await queryInterface.addIndex('package_bookings', ['customer_id']);
    await queryInterface.addIndex('package_bookings', ['payment_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('package_bookings');
  }
};
