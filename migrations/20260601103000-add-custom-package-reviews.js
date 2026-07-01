'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_reviews_reviewable_type" ADD VALUE IF NOT EXISTS \'custom_package\';'
    );

    await queryInterface.changeColumn('reviews', 'reviewable_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('reviews', 'trip_inquiry_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'trip_inquiries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addIndex('reviews', ['trip_inquiry_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('reviews', ['trip_inquiry_id']);
    await queryInterface.removeColumn('reviews', 'trip_inquiry_id');
    await queryInterface.changeColumn('reviews', 'reviewable_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
