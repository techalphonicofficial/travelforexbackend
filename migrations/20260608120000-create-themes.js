'use strict';

const { DEFAULT_THEME_PRESETS } = require('../src/utils/themeColours');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('themes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false,
        unique: true
      },
      values: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('themes', ['is_active'], {
      unique: true,
      where: { is_active: true },
      name: 'themes_single_active_idx'
    });

    const now = new Date();
    await queryInterface.bulkInsert('themes', DEFAULT_THEME_PRESETS.map(theme => ({
      name: theme.name,
      slug: theme.slug,
      values: JSON.stringify(theme.values),
      is_active: theme.is_active,
      created_at: now,
      updated_at: now
    })));
  },

  async down(queryInterface) {
    await queryInterface.dropTable('themes');
  }
};
