'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add destination_id column
    await queryInterface.addColumn('activities', 'destination_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially true for data migration
      references: { model: 'destinations', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Data Migration: For each activity, find a destination in its city and link it.
    const activities = await queryInterface.sequelize.query(
      `SELECT id, city_id FROM activities`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const act of activities) {
      const mapping = await queryInterface.sequelize.query(
        `SELECT destination_id FROM destination_mappings WHERE city_id = ? LIMIT 1`,
        { 
          replacements: [act.city_id],
          type: Sequelize.QueryTypes.SELECT 
        }
      );

      if (mapping && mapping.length > 0) {
        await queryInterface.sequelize.query(
          `UPDATE activities SET destination_id = ? WHERE id = ?`,
          { replacements: [mapping[0].destination_id, act.id] }
        );
      }
    }

    // 3. Remove city_id column
    await queryInterface.removeColumn('activities', 'city_id');
  },

  async down (queryInterface, Sequelize) {
    // 1. Add city_id column back
    await queryInterface.addColumn('activities', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'cities', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Rollback Data: For each activity, find the city of its destination
    const activities = await queryInterface.sequelize.query(
      `SELECT id, destination_id FROM activities WHERE destination_id IS NOT NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const act of activities) {
        const mapping = await queryInterface.sequelize.query(
            `SELECT city_id FROM destination_mappings WHERE destination_id = ? LIMIT 1`,
            { 
              replacements: [act.destination_id],
              type: Sequelize.QueryTypes.SELECT 
            }
          );
    
          if (mapping && mapping.length > 0) {
            await queryInterface.sequelize.query(
              `UPDATE activities SET city_id = ? WHERE id = ?`,
              { replacements: [mapping[0].city_id, act.id] }
            );
          }
    }

    // 3. Remove destination_id column
    await queryInterface.removeColumn('activities', 'destination_id');
  }
};
