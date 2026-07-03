'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_passengers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
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
      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      passport_no: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      passport_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_lead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    await queryInterface.addIndex('booking_passengers', ['booking_id'], {
      name: 'idx_booking_passengers_booking_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_passengers');
    // Drop ENUM type for postgres
    try {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_booking_passengers_gender";');
    } catch (_) {}
  }
};
