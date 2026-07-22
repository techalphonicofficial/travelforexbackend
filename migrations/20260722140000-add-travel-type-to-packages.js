'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('packages');
        if (!table.travel_type) {
            await queryInterface.addColumn('packages', 'travel_type', {
                type: Sequelize.ENUM('domestic', 'international'),
                allowNull: false,
                defaultValue: 'domestic'
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable('packages');
        if (table.travel_type) {
            await queryInterface.removeColumn('packages', 'travel_type');
        }

        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_packages_travel_type";');
        }
    }
};
