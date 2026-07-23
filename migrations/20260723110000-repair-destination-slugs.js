'use strict';

function slugify(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 220) || 'destination';
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      let columns = await queryInterface.describeTable('destinations', { transaction });
      if (!columns.slug) {
        await queryInterface.addColumn('destinations', 'slug', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
        columns = await queryInterface.describeTable('destinations', { transaction });
      }

      const [destinations] = await queryInterface.sequelize.query(
        'SELECT id, name, slug FROM destinations ORDER BY id ASC',
        { transaction }
      );
      const usedSlugs = new Set(
        destinations
          .map(destination => String(destination.slug || '').trim())
          .filter(Boolean)
      );

      for (const destination of destinations) {
        if (String(destination.slug || '').trim()) continue;

        const baseSlug = slugify(destination.name);
        let slug = baseSlug;
        let suffix = 2;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }

        await queryInterface.sequelize.query(
          'UPDATE destinations SET slug = :slug WHERE id = :id',
          { replacements: { slug, id: destination.id }, transaction }
        );
        usedSlugs.add(slug);
      }

      await queryInterface.changeColumn('destinations', 'slug', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      const indexes = await queryInterface.showIndex('destinations', { transaction });
      const hasUniqueSlugIndex = indexes.some(index =>
        index.unique
        && index.fields.length === 1
        && index.fields[0].attribute === 'slug'
      );
      if (!hasUniqueSlugIndex) {
        await queryInterface.addIndex('destinations', ['slug'], {
          name: 'destinations_slug_unique',
          unique: true,
          transaction
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const indexes = await queryInterface.showIndex('destinations', { transaction });
      if (indexes.some(index => index.name === 'destinations_slug_unique')) {
        await queryInterface.removeIndex('destinations', 'destinations_slug_unique', { transaction });
      }

      await queryInterface.changeColumn('destinations', 'slug', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
