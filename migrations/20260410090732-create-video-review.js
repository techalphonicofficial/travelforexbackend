'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('video_reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      user_name: {
        type: Sequelize.STRING
      },
      user_handle: {
        type: Sequelize.STRING
      },
      user_avatar: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      video_url: {
        type: Sequelize.STRING
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      package_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'packages',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('video_reviews');
  }
};