'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_email_queue', {
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
        allowNull: false
      },
      email_type: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: 'package_itinerary'
      },
      recipient_email: {
        type: Sequelize.STRING(180),
        allowNull: false
      },
      recipient_name: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      html_body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      text_body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'pending'
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_attempt_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      provider_response: {
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

    await queryInterface.addIndex('booking_email_queue', ['booking_id'], { name: 'idx_booking_email_queue_booking_id' });
    await queryInterface.addIndex('booking_email_queue', ['status', 'scheduled_at'], { name: 'idx_booking_email_queue_status_scheduled' });
    await queryInterface.addIndex('booking_email_queue', ['recipient_email'], { name: 'idx_booking_email_queue_recipient' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('booking_email_queue');
  }
};
