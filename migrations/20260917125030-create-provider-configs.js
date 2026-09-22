'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('provider_configs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            provider_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            api_key: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            test_url: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            production_url: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            environment: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'TEST'
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('provider_configs');
    }
};