'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('packages');

      if (!table.sort_order) {
        await queryInterface.addColumn('packages', 'sort_order', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }, { transaction });

        await queryInterface.sequelize.query(`
          UPDATE packages AS p
          SET sort_order = ranked.position
          FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) AS position
            FROM packages
          ) AS ranked
          WHERE p.id = ranked.id
        `, { transaction });
      }

      if (!table.meta_title) {
        await queryInterface.addColumn('packages', 'meta_title', {
          type: Sequelize.STRING(255),
          allowNull: true
        }, { transaction });
      }
      if (!table.meta_description) {
        await queryInterface.addColumn('packages', 'meta_description', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction });
      }
      if (!table.meta_keyword) {
        await queryInterface.addColumn('packages', 'meta_keyword', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction });
      }
      if (!table.schema) {
        await queryInterface.addColumn('packages', 'schema', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('packages');
      for (const column of ['schema', 'meta_keyword', 'meta_description', 'meta_title', 'sort_order']) {
        if (table[column]) await queryInterface.removeColumn('packages', column, { transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
