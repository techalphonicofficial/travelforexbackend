'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bookings', {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            booking_reference: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },

            user_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },

            booking_type: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },

            provider: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            provider_booking_id: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },

            provider_reference: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },

            status: {
                type: Sequelize.STRING(40),
                allowNull: false,
                defaultValue: 'INITIATED',
            },

            payment_status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'PENDING',
            },

            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
            },

            currency: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'INR',
            },

            correlation_id: {
                type: Sequelize.STRING(150),
                allowNull: true,
            },

            booking_data: {
                type: Sequelize.JSONB,
                allowNull: true,
            },

            payment_data: {
                type: Sequelize.JSONB,
                allowNull: true,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    'CURRENT_TIMESTAMP'
                ),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    'CURRENT_TIMESTAMP'
                ),
            },
        });

        await queryInterface.addIndex(
            'bookings',
            ['provider_booking_id'],
            {
                name: 'idx_bookings_provider_booking_id',
            }
        );

        await queryInterface.addIndex(
            'bookings',
            ['user_id'],
            {
                name: 'idx_bookings_user_id',
            }
        );

        await queryInterface.addIndex(
            'bookings',
            ['booking_type'],
            {
                name: 'idx_bookings_booking_type',
            }
        );

        await queryInterface.addIndex(
            'bookings',
            ['status'],
            {
                name: 'idx_bookings_status',
            }
        );

        await queryInterface.addIndex(
            'bookings',
            ['payment_status'],
            {
                name: 'idx_bookings_payment_status',
            }
        );

        await queryInterface.addIndex(
            'bookings',
            ['correlation_id'],
            {
                name: 'idx_bookings_correlation_id',
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('bookings');
    },
};