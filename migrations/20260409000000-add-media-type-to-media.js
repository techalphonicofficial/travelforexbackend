'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('media', 'media_type', {
      type: Sequelize.ENUM('image', 'video'),
      allowNull: false,
      defaultValue: 'image'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('media', 'media_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_media_media_type";');
  }
};
