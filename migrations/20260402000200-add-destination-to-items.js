'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add destination_id column to package_items table
    await queryInterface.addColumn('package_items', 'destination_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'destinations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('package_items', 'destination_id');
  }
};
