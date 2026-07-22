'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('package_bookings');
    if (!table.hotel_amount) {
      await queryInterface.addColumn('package_bookings', 'hotel_amount', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('package_bookings');
    if (table.hotel_amount) await queryInterface.removeColumn('package_bookings', 'hotel_amount');
  }
};
