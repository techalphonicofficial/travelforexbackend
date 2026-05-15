'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'tag_color', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'gray'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'tag_color');
  }
};
