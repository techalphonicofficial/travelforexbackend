'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'provider_configs',
            'hotel_url',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );

        await queryInterface.addColumn(
            'provider_configs',
            'flight_url',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );

        // Existing hotel test URL -> hotel_url
        await queryInterface.sequelize.query(`
            UPDATE provider_configs
            SET hotel_url = test_url
            WHERE hotel_url IS NULL
        `);

        // Flight API base URL
        await queryInterface.sequelize.query(`
            UPDATE provider_configs
            SET flight_url = 'https://apitest.tripjack.com'
            WHERE provider_name = 'TRIPJACK'
        `);

        await queryInterface.removeColumn(
            'provider_configs',
            'test_url'
        );

        await queryInterface.removeColumn(
            'provider_configs',
            'production_url'
        );

        await queryInterface.changeColumn(
            'provider_configs',
            'hotel_url',
            {
                type: Sequelize.TEXT,
                allowNull: false
            }
        );

        await queryInterface.changeColumn(
            'provider_configs',
            'flight_url',
            {
                type: Sequelize.TEXT,
                allowNull: false
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'provider_configs',
            'test_url',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );

        await queryInterface.addColumn(
            'provider_configs',
            'production_url',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );

        await queryInterface.sequelize.query(`
            UPDATE provider_configs
            SET test_url = hotel_url
            WHERE test_url IS NULL
        `);

        await queryInterface.sequelize.query(`
            UPDATE provider_configs
            SET production_url = hotel_url
            WHERE production_url IS NULL
        `);

        await queryInterface.removeColumn(
            'provider_configs',
            'hotel_url'
        );

        await queryInterface.removeColumn(
            'provider_configs',
            'flight_url'
        );

        await queryInterface.changeColumn(
            'provider_configs',
            'test_url',
            {
                type: Sequelize.TEXT,
                allowNull: false
            }
        );

        await queryInterface.changeColumn(
            'provider_configs',
            'production_url',
            {
                type: Sequelize.TEXT,
                allowNull: false
            }
        );
    }
};