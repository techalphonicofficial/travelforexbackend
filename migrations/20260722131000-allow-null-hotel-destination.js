'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "hotels" ALTER COLUMN "destination_id" DROP NOT NULL'
    );
  },

  async down(queryInterface) {
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
    `);
    await queryInterface.sequelize.query(
      'ALTER TABLE "hotels" ALTER COLUMN "destination_id" SET NOT NULL'
    );
  }
};
