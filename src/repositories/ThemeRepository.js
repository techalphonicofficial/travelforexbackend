const BaseRepository = require('./BaseRepository');

function slugify(value = '') {
  return String(value || 'theme')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'theme';
}

function isMissingThemesTableError(err) {
  const code = err?.parent?.code || err?.original?.code || err?.code;
  const message = String(err?.message || '');
  return code === '42P01' || message.includes('relation "themes" does not exist');
}

class ThemeRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findActive(options = {}) {
    try {
      return await this.model.findOne({
        where: { is_active: true },
        order: [['updated_at', 'DESC'], ['id', 'DESC']],
        ...options
      });
    } catch (err) {
      if (isMissingThemesTableError(err)) return null;
      throw err;
    }
  }

  async findAllOrdered() {
    try {
      return await this.model.findAll({
        order: [['is_active', 'DESC'], ['updated_at', 'DESC'], ['id', 'DESC']]
      });
    } catch (err) {
      if (isMissingThemesTableError(err)) return [];
      throw err;
    }
  }

  async ensureUniqueSlug(name, currentId = null, transaction = null) {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.model.findOne({ where: { slug }, transaction });
      if (!existing || (currentId && Number(existing.id) === Number(currentId))) return slug;
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  async saveAndActivate({ id = null, name, values }) {
    const transaction = await this.model.sequelize.transaction();
    try {
      const safeName = String(name || '').trim() || 'Default Theme';
      let theme = id ? await this.model.findByPk(id, { transaction }) : null;
      const slug = await this.ensureUniqueSlug(safeName, theme?.id || null, transaction);

      await this.model.update({ is_active: false }, { where: {}, transaction });

      if (theme) {
        await theme.update({ name: safeName, slug, values, is_active: true }, { transaction });
      } else {
        theme = await this.model.create({ name: safeName, slug, values, is_active: true }, { transaction });
      }

      await transaction.commit();
      return theme;
    } catch (err) {
      await transaction.rollback();
      if (isMissingThemesTableError(err)) return null;
      throw err;
    }
  }
}

module.exports = ThemeRepository;
