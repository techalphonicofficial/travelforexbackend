'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        const exists = tables.some(table => String(typeof table === 'object' ? (table.tableName || table.name) : table).toLowerCase() === 'package_highlights');
        if (exists) return;

        await queryInterface.createTable('package_highlights', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            package_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'packages', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        });

        await queryInterface.addIndex('package_highlights', ['package_id', 'sort_order'], {
            name: 'package_highlights_package_order_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('package_highlights');
    }
};
