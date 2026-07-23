'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('destinations', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.sequelize.query(`
            UPDATE destinations AS destination
            SET country = mapped.country_name,
                updated_at = NOW()
            FROM (
                SELECT DISTINCT ON (mapping.destination_id)
                    mapping.destination_id,
                    country.name AS country_name
                FROM destination_mappings AS mapping
                INNER JOIN cities AS city ON city.id = mapping.city_id
                INNER JOIN countries AS country ON country.id = city.country_id
                ORDER BY mapping.destination_id, mapping.id
            ) AS mapped
            WHERE destination.id = mapped.destination_id
              AND destination.country IS DISTINCT FROM mapped.country_name
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('destinations', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: 'India'
        });
    }
};
