const { Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');

class ForexConversionRateRepository extends BaseRepository {
  constructor(model, countryModel, continentModel) {
    super(model);
    this.countryModel = countryModel;
    this.continentModel = continentModel;
  }

  includeCountry(required = false) {
    return [{
      model: this.countryModel,
      as: 'country',
      required,
      attributes: ['id', 'name', 'continent_id'],
      include: this.continentModel
        ? [{ model: this.continentModel, as: 'continent', attributes: ['id', 'name'] }]
        : []
    }];
  }

  normalizePayload(data = {}) {
    return {
      country_id: data.country_id,
      code: String(data.code || '').trim().toUpperCase(),
      base_code: String(data.base_code || 'INR').trim().toUpperCase(),
      conversion_rate: Number(data.conversion_rate || 0),
      is_active: data.is_active === undefined ? true : Boolean(data.is_active === true || data.is_active === 'true' || data.is_active === 'on' || data.is_active === '1' || data.is_active === 1),
      notes: data.notes ? String(data.notes).trim().slice(0, 255) : null
    };
  }

  validatePayload(payload = {}) {
    if (!payload.country_id) return 'Country is required';
    if (!payload.code) return 'Currency code is required';
    if (!payload.base_code) return 'Base code is required';
    if (!Number.isFinite(Number(payload.conversion_rate)) || Number(payload.conversion_rate) <= 0) return 'Conversion rate must be greater than zero';
    return null;
  }

  async findAll() {
    return this.model.findAll({
      include: this.includeCountry(),
      order: [['updated_at', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async findById(id) {
    return this.model.findByPk(id, {
      include: this.includeCountry()
    });
  }

  async findPublic(filters = {}) {
    const where = { is_active: true };
    const include = this.includeCountry(Boolean(filters.country));
    const code = String(filters.code || filters.currency_code || '').trim().toUpperCase();
    const baseCode = String(filters.base_code || '').trim().toUpperCase();
    const countryId = parseInt(filters.country_id, 10);
    const country = String(filters.country || '').trim();

    if (code) where.code = code;
    if (baseCode) where.base_code = baseCode;
    if (Number.isInteger(countryId) && countryId > 0) where.country_id = countryId;
    if (country && include[0]) {
      include[0].where = { name: { [Op.iLike]: `%${country}%` } };
    }

    return this.model.findAll({
      where,
      include,
      order: [['country_id', 'ASC'], ['code', 'ASC']]
    });
  }

  async findByCountryOrCode(value) {
    const key = String(value || '').trim();
    if (!key) return [];

    const parsedId = parseInt(key, 10);
    const where = {
      is_active: true,
      [Op.or]: [
        { code: key.toUpperCase() },
        { base_code: key.toUpperCase() },
        { '$country.name$': { [Op.iLike]: `%${key}%` } }
      ]
    };

    if (Number.isInteger(parsedId) && parsedId > 0) {
      where[Op.or].push({ country_id: parsedId });
    }

    return this.model.findAll({
      where,
      include: this.includeCountry(),
      order: [['country_id', 'ASC'], ['code', 'ASC']]
    });
  }

  serialize(row) {
    const item = row && row.get ? row.get({ plain: true }) : row;
    if (!item) return null;
    return {
      id: item.id,
      country_id: item.country_id,
      country: item.country ? {
        id: item.country.id,
        name: item.country.name,
        continent: item.country.continent ? {
          id: item.country.continent.id,
          name: item.country.continent.name
        } : null
      } : null,
      code: item.code,
      base_code: item.base_code,
      conversion_rate: Number(item.conversion_rate || 0),
      is_active: Boolean(item.is_active),
      notes: item.notes || null,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  serializePublic(row) {
    const item = this.serialize(row);
    if (!item) return null;
    return {
      country: item.country ? item.country.name : null,
      country_id: item.country_id,
      code: item.code,
      base_code: item.base_code,
      conversion_rate: item.conversion_rate,
      updated_at: item.updated_at
    };
  }
}

module.exports = ForexConversionRateRepository;
