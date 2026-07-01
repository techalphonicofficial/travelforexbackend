const BaseRepository = require('./BaseRepository');

const normalizeCode = (value) => String(value || '').trim().toUpperCase();
const toMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};
const nullableMoney = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return toMoney(value);
};
const nullableInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
const asBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return value === true || value === 'true' || value === 'on' || value === '1' || value === 1;
};
const asDateOnly = (value) => {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
};
const parsePackageIds = (value) => {
  const raw = Array.isArray(value) ? value : (value === undefined || value === null || value === '' ? [] : [value]);
  return [...new Set(raw
    .flatMap(item => String(item || '').split(','))
    .map(item => parseInt(item, 10))
    .filter(item => Number.isInteger(item) && item > 0))];
};

class CouponRepository extends BaseRepository {
  constructor(model, redemptionModel = null) {
    super(model);
    this.redemptionModel = redemptionModel;
  }

  normalizePayload(data = {}) {
    const scope = data.applicable_scope === 'package_specific' ? 'package_specific' : 'all';
    return {
      code: normalizeCode(data.code),
      name: String(data.name || '').trim(),
      description: String(data.description || '').trim() || null,
      discount_type: data.discount_type === 'percent' ? 'percent' : 'fixed',
      discount_value: toMoney(data.discount_value),
      max_discount_amount: nullableMoney(data.max_discount_amount),
      minimum_booking_amount: toMoney(data.minimum_booking_amount),
      valid_from: asDateOnly(data.valid_from),
      valid_until: asDateOnly(data.valid_until),
      usage_limit: nullableInteger(data.usage_limit),
      usage_limit_per_customer: nullableInteger(data.usage_limit_per_customer),
      applicable_scope: scope,
      applicable_package_ids: scope === 'package_specific' ? parsePackageIds(data.applicable_package_ids || data['applicable_package_ids[]']) : [],
      is_active: asBoolean(data.is_active, true)
    };
  }

  validatePayload(payload = {}) {
    if (!payload.code) return 'Coupon code is required';
    if (!/^[A-Z0-9_-]{3,40}$/.test(payload.code)) return 'Coupon code must be 3-40 characters using letters, numbers, hyphen, or underscore';
    if (!payload.name) return 'Coupon name is required';
    if (!['fixed', 'percent'].includes(payload.discount_type)) return 'Discount type is invalid';
    if (!payload.discount_value || payload.discount_value <= 0) return 'Discount value must be greater than zero';
    if (payload.discount_type === 'percent' && payload.discount_value > 100) return 'Percentage discount cannot be more than 100';
    if (payload.max_discount_amount !== null && payload.max_discount_amount < 0) return 'Maximum discount cannot be negative';
    if (payload.minimum_booking_amount < 0) return 'Minimum booking amount cannot be negative';
    if (payload.valid_from && payload.valid_until && payload.valid_from > payload.valid_until) return 'Valid from date cannot be after valid until date';
    if (payload.applicable_scope === 'package_specific' && !payload.applicable_package_ids.length) return 'Select at least one package for a package-specific coupon';
    return null;
  }

  async findAll() {
    return this.model.findAll({
      order: [['is_active', 'DESC'], ['updated_at', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async findById(id) {
    return this.model.findByPk(id);
  }

  async findByCode(code) {
    return this.model.findOne({ where: { code: normalizeCode(code) } });
  }

  serialize(row) {
    const item = row && row.get ? row.get({ plain: true }) : row;
    if (!item) return null;
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description || null,
      discount_type: item.discount_type,
      discount_value: Number(item.discount_value || 0),
      max_discount_amount: item.max_discount_amount === null || item.max_discount_amount === undefined ? null : Number(item.max_discount_amount || 0),
      minimum_booking_amount: Number(item.minimum_booking_amount || 0),
      valid_from: item.valid_from || null,
      valid_until: item.valid_until || null,
      usage_limit: item.usage_limit || null,
      usage_limit_per_customer: item.usage_limit_per_customer || null,
      applicable_scope: item.applicable_scope || 'all',
      applicable_package_ids: Array.isArray(item.applicable_package_ids) ? item.applicable_package_ids : [],
      is_active: item.is_active !== false,
      redemption_count: Number(item.redemption_count || 0),
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }
}

module.exports = CouponRepository;
