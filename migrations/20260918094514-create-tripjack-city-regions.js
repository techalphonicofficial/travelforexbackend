'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tripjack_city_regions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            cityRegionId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: true
            },
            cityName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            regionName: Sequelize.STRING,
            countryName: Sequelize.STRING,
            regionType: Sequelize.STRING,
            fullRegionName: Sequelize.STRING,
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Fast case-insensitive search (used by cityName ILIKE '%goa%')
        await queryInterface.addIndex('tripjack_city_regions', ['cityName']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('tripjack_city_regions');
    }
};