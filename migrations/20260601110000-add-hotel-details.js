'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('hotels', 'total_rooms', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('hotels', 'guest_rating', {
      type: Sequelize.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 0.0
    });

    await queryInterface.addColumn('hotels', 'amenities', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: []
    });

    await queryInterface.addColumn('hotels', 'discount_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('hotels', 'discount_percent');
    await queryInterface.removeColumn('hotels', 'amenities');
    await queryInterface.removeColumn('hotels', 'guest_rating');
    await queryInterface.removeColumn('hotels', 'total_rooms');
  }
};
