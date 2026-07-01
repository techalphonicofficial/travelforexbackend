'use strict';

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName).catch(() => null);
  if (!table || table[columnName]) return;
  await queryInterface.addColumn(tableName, columnName, definition);
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName).catch(() => null);
  if (!table || !table[columnName]) return;
  await queryInterface.removeColumn(tableName, columnName);
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discount_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'fixed'
      },
      discount_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      minimum_booking_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      valid_from: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      valid_until: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usage_limit_per_customer: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      applicable_scope: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'all'
      },
      applicable_package_ids: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      redemption_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.addIndex('coupons', ['code'], { unique: true, name: 'coupons_code_unique_idx' });
    await queryInterface.addIndex('coupons', ['is_active']);

    await queryInterface.createTable('coupon_redemptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      coupon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'package_bookings',
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
      customer_email: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      coupon_code: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      booking_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      redeemed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    await queryInterface.addIndex('coupon_redemptions', ['coupon_id']);
    await queryInterface.addIndex('coupon_redemptions', ['booking_id']);
    await queryInterface.addIndex('coupon_redemptions', ['customer_id']);
    await queryInterface.addIndex('coupon_redemptions', ['customer_email']);

    await addColumnIfMissing(queryInterface, 'package_bookings', 'coupon_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'coupons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await addColumnIfMissing(queryInterface, 'package_bookings', 'coupon_code', {
      type: Sequelize.STRING(40),
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, 'package_bookings', 'coupon_discount_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    });
    await addColumnIfMissing(queryInterface, 'package_bookings', 'coupon_snapshot', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    });

    await queryInterface.addIndex('package_bookings', ['coupon_id']).catch(() => null);
    await queryInterface.addIndex('package_bookings', ['coupon_code']).catch(() => null);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('package_bookings', ['coupon_code']).catch(() => null);
    await queryInterface.removeIndex('package_bookings', ['coupon_id']).catch(() => null);
    await removeColumnIfExists(queryInterface, 'package_bookings', 'coupon_snapshot');
    await removeColumnIfExists(queryInterface, 'package_bookings', 'coupon_discount_amount');
    await removeColumnIfExists(queryInterface, 'package_bookings', 'coupon_code');
    await removeColumnIfExists(queryInterface, 'package_bookings', 'coupon_id');

    await queryInterface.dropTable('coupon_redemptions');
    await queryInterface.dropTable('coupons');
  }
};
