'use strict';

const { DEFAULT_THEME_PRESETS } = require('../src/utils/themeColours');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const presetThemes = DEFAULT_THEME_PRESETS.filter(theme => theme.slug !== 'default-theme');

    for (const theme of presetThemes) {
      await queryInterface.sequelize.query(`
        INSERT INTO themes (name, slug, values, is_active, created_at, updated_at)
        VALUES (:name, :slug, CAST(:values AS JSONB), false, :createdAt, :updatedAt)
        ON CONFLICT (slug) DO NOTHING
      `, {
        replacements: {
          name: theme.name,
          slug: theme.slug,
          values: JSON.stringify(theme.values),
          createdAt: now,
          updatedAt: now
        }
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('themes', {
      slug: DEFAULT_THEME_PRESETS
        .filter(theme => theme.slug !== 'default-theme')
        .map(theme => theme.slug)
    });
  }
};
