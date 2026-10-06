'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'provider_configs',
            'hotel_book_url',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(
            'provider_configs',
            'hotel_book_url'
        );
    }
};