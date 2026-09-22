'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payment_gateway_configs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            // Gateway name
            gateway: {
                type: Sequelize.STRING(50),
                allowNull: false
            },

            // UAT / PRODUCTION
            environment: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'UAT'
            },

            // Gateway API base URL
            base_url: {
                type: Sequelize.STRING(500),
                allowNull: false
            },

            // ICICI merchant ID
            merchant_id: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            // ICICI aggregator ID
            aggregator_id: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            // Secret key - will be encrypted later
            secure_key: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            // Initiate Sale API
            initiate_sale_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },

            // Gateway redirect URL
            redirect_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },

            // Default currency
            currency: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'INR'
            },

            // Whether this gateway configuration is active
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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

        // Fast lookup for active gateway
        await queryInterface.addIndex(
            'payment_gateway_configs',
            ['gateway', 'environment'],
            {
                name: 'payment_gateway_configs_gateway_environment_idx'
            }
        );

        await queryInterface.addIndex(
            'payment_gateway_configs',
            ['is_active'],
            {
                name: 'payment_gateway_configs_is_active_idx'
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('payment_gateway_configs');
    }
};