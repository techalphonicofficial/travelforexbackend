'use strict';

/*
 * Local index of supplier hotel names, so the hotel search box can suggest
 * hotels by name (the supplier has no name-search API for us).
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tripjack_hotel_index', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            tjHotelId: {
                type: Sequelize.STRING(32),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cityName: Sequelize.STRING,
            stateName: Sequelize.STRING,
            countryName: Sequelize.STRING,
            // city region this hotel was synced from (null when added from a listing)
            cityRegionId: Sequelize.BIGINT,
            starRating: Sequelize.FLOAT,
            propertyType: Sequelize.STRING,
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex('tripjack_hotel_index', ['name']);
        await queryInterface.addIndex('tripjack_hotel_index', ['cityRegionId']);

        // Fast "contains" search over millions of names: trigram index on
        // "name city". Needs the pg_trgm extension; without it the search
        // still works, only slower.
        try {
            await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            await queryInterface.sequelize.query(
                `CREATE INDEX IF NOT EXISTS tripjack_hotel_index_search_trgm
                 ON tripjack_hotel_index
                 USING gin ((lower("name" || ' ' || coalesce("cityName", ''))) gin_trgm_ops)`
            );
        } catch (error) {
            console.warn('pg_trgm not available, hotel search will use a plain scan:', error.message);
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('tripjack_hotel_index');
    }
};
