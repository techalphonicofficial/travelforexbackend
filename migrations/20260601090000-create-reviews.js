'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reviewable_type: {
        type: Sequelize.ENUM('package', 'custom_booking'),
        allowNull: false
      },
      reviewable_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
      custom_trip_id: {
        type: Sequelize.INTEGER,
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewer_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reviewer_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reviewer_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'approved'
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'api'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('reviews', ['reviewable_type', 'reviewable_id']);
    await queryInterface.addIndex('reviews', ['package_id']);
    await queryInterface.addIndex('reviews', ['custom_trip_id']);
    await queryInterface.addIndex('reviews', ['customer_id']);
    await queryInterface.addIndex('reviews', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_reviewable_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_status";');
  }
};
