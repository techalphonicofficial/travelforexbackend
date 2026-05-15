'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('package_days', 'destination_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'destinations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Make city_id nullable if it wasn't already
    await queryInterface.changeColumn('package_days', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('package_days', 'destination_id');
  }
};
