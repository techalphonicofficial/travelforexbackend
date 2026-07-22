'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('hotels');
      if (!table.city_id) {
        await queryInterface.addColumn('hotels', 'city_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'cities', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });

        await queryInterface.sequelize.query(`
          UPDATE hotels AS h
          SET city_id = mapping.city_id
          FROM (
            SELECT destination_id, MIN(city_id) AS city_id
            FROM destination_mappings
            GROUP BY destination_id
          ) AS mapping
          WHERE h.destination_id = mapping.destination_id
            AND h.city_id IS NULL
        `, { transaction });
      }

      if (table.destination_id && table.destination_id.allowNull === false) {
        await queryInterface.changeColumn('hotels', 'destination_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'destinations', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('hotels');
      if (table.city_id) {
        await queryInterface.sequelize.query(`
          UPDATE hotels AS h
          SET destination_id = mapping.destination_id
          FROM (
            SELECT city_id, MIN(destination_id) AS destination_id
            FROM destination_mappings
            GROUP BY city_id
          ) AS mapping
          WHERE h.city_id = mapping.city_id
            AND h.destination_id IS NULL
        `, { transaction });
        await queryInterface.removeColumn('hotels', 'city_id', { transaction });
      }
      await queryInterface.changeColumn('hotels', 'destination_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
