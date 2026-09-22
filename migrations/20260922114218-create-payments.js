'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payments', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            custom_trip_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'custom_trips',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },

            booking_id: {
                type: Sequelize.BIGINT,
                allowNull: true
            },

            user_id: {
                type: Sequelize.BIGINT,
                allowNull: false
            },

            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },

            currency: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'INR'
            },

            gateway: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: 'ICICI_ORANGE_PG'
            },

            merchant_txn_no: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true
            },

            transaction_id: {
                type: Sequelize.STRING(100),
                allowNull: true
            },

            tran_ctx: {
                type: Sequelize.STRING(150),
                allowNull: true,
                unique: true
            },

            payment_data: {
                type: Sequelize.JSONB,
                allowNull: true
            },

            gateway_response: {
                type: Sequelize.JSONB,
                allowNull: true
            },

            status: {
                type: Sequelize.ENUM(
                    'pending',
                    'success',
                    'failed'
                ),
                allowNull: false,
                defaultValue: 'pending'
            },

            paid_at: {
                type: Sequelize.DATE,
                allowNull: true
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

        // Indexes for faster payment lookup
        await queryInterface.addIndex('payments', ['booking_id'], {
            name: 'payments_booking_id_idx'
        });

        await queryInterface.addIndex('payments', ['user_id'], {
            name: 'payments_user_id_idx'
        });

        await queryInterface.addIndex('payments', ['status'], {
            name: 'payments_status_idx'
        });

        await queryInterface.addIndex('payments', ['tran_ctx'], {
            name: 'payments_tran_ctx_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('payments');

        // PostgreSQL ENUM cleanup
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_payments_status";'
        );
    }
};