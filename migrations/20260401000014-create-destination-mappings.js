'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('destination_mappings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      continent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'continents', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'countries', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'cities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('destination_mappings');
  }
};
