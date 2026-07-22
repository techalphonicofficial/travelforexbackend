'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('package_bookings');
    if (!table.from_date) {
      await queryInterface.addColumn('package_bookings', 'from_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
    }
    if (!table.to_date) {
      await queryInterface.addColumn('package_bookings', 'to_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
    }
    if (!table.departure_date) {
      await queryInterface.addColumn('package_bookings', 'departure_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('package_bookings');
    if (table.departure_date) await queryInterface.removeColumn('package_bookings', 'departure_date');
    if (table.to_date) await queryInterface.removeColumn('package_bookings', 'to_date');
    if (table.from_date) await queryInterface.removeColumn('package_bookings', 'from_date');
  }
};
