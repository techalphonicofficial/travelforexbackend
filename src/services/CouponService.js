const normalizeCode = (value) => String(value || '').trim().toUpperCase();
const toMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};
const clean = (value) => String(value || '').trim();
const httpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const todayDateOnly = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

class CouponService {
  constructor({ Coupon, CouponRedemption } = {}) {
    this.Coupon = Coupon;
    this.CouponRedemption = CouponRedemption;
  }

  serializeCoupon(row) {
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
      redemption_count: Number(item.redemption_count || 0)
    };
  }

  calculateDiscount(coupon, bookingAmount) {
    const amount = toMoney(bookingAmount);
    const value = toMoney(coupon.discount_value);
    let discount = coupon.discount_type === 'percent' ? amount * value / 100 : value;

    if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined && coupon.max_discount_amount !== '') {
      discount = Math.min(discount, toMoney(coupon.max_discount_amount));
    }

    return toMoney(Math.min(Math.max(discount, 0), amount));
  }

  async validate({ code, packageId = null, customerId = null, customerEmail = null, bookingAmount = 0 } = {}) {
    if (!this.Coupon) throw httpError('Coupons are not configured.', 500);

    const couponCode = normalizeCode(code);
    if (!couponCode) throw httpError('Coupon code is required.');

    const coupon = await this.Coupon.findOne({ where: { code: couponCode } });
    if (!coupon) throw httpError('Coupon not found.', 404);
    if (coupon.is_active === false) throw httpError('Coupon is inactive.');

    const today = todayDateOnly();
    if (coupon.valid_from && String(coupon.valid_from) > today) throw httpError('Coupon is not active yet.');
    if (coupon.valid_until && String(coupon.valid_until) < today) throw httpError('Coupon has expired.');

    const baseAmount = toMoney(bookingAmount);
    const minimumAmount = toMoney(coupon.minimum_booking_amount);
    if (baseAmount < minimumAmount) {
      throw httpError(`Minimum booking amount for this coupon is INR ${minimumAmount.toFixed(2)}.`);
    }

    const applicableScope = clean(coupon.applicable_scope) || 'all';
    const applicablePackages = Array.isArray(coupon.applicable_package_ids) ? coupon.applicable_package_ids.map(Number) : [];
    const parsedPackageId = parseInt(packageId, 10);
    if (applicableScope === 'package_specific' && (!Number.isInteger(parsedPackageId) || !applicablePackages.includes(parsedPackageId))) {
      throw httpError('Coupon is not applicable for this package.');
    }

    if (this.CouponRedemption) {
      const usageLimit = parseInt(coupon.usage_limit, 10);
      if (Number.isInteger(usageLimit) && usageLimit > 0) {
        const totalUsed = await this.CouponRedemption.count({ where: { coupon_id: coupon.id } });
        if (totalUsed >= usageLimit) throw httpError('Coupon usage limit has been reached.');
      }

      const perCustomerLimit = parseInt(coupon.usage_limit_per_customer, 10);
      const email = clean(customerEmail).toLowerCase();
      if (Number.isInteger(perCustomerLimit) && perCustomerLimit > 0 && (customerId || email)) {
        const where = { coupon_id: coupon.id };
        if (customerId) where.customer_id = customerId;
        else where.customer_email = email;
        const customerUsed = await this.CouponRedemption.count({ where });
        if (customerUsed >= perCustomerLimit) throw httpError('Coupon usage limit for this customer has been reached.');
      }
    }

    const discountAmount = this.calculateDiscount(coupon, baseAmount);
    if (discountAmount <= 0) throw httpError('Coupon discount is not available for this booking.');

    return {
      coupon,
      coupon_code: coupon.code,
      booking_amount: baseAmount,
      discount_amount: discountAmount,
      amount_after_discount: toMoney(baseAmount - discountAmount)
    };
  }

  async redeem({ coupon, booking, customerId = null, customerEmail = null, bookingAmount = 0, discountAmount = 0, transaction = null } = {}) {
    if (!this.CouponRedemption || !this.Coupon || !coupon || !booking) return null;

    const redemption = await this.CouponRedemption.create({
      coupon_id: coupon.id,
      booking_id: booking.id,
      customer_id: customerId || null,
      customer_email: clean(customerEmail).toLowerCase() || null,
      coupon_code: coupon.code,
      booking_amount: toMoney(bookingAmount),
      discount_amount: toMoney(discountAmount),
      redeemed_at: new Date()
    }, { transaction });

    await this.Coupon.increment('redemption_count', {
      by: 1,
      where: { id: coupon.id },
      transaction
    });

    return redemption;
  }
}

module.exports = CouponService;
