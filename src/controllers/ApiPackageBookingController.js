const CouponService = require('../services/CouponService');

const isUuid = (value) => (
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
);

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const cleanUrl = (value) => clean(value).replace(/(%22|")$/i, '');
const normalizeAccessValue = (value) => clean(value).toLowerCase().replace(/[\s-]+/g, '_');
const money = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};
const refundAllowedRoles = ['admin', 'manager'];
const dayMs = 24 * 60 * 60 * 1000;
const cancellationDateKeys = [
  'departure_date',
  'departureDate',
  'travel_date',
  'travelDate',
  'start_date',
  'startDate',
  'trip_start_date',
  'tripStartDate',
  'journey_date',
  'journeyDate',
  'package_start_date',
  'packageStartDate',
  'selected_date',
  'selectedDate'
];
const falseFlags = ['false', '0', 'no', 'off'];
const trueFlags = ['true', '1', 'yes', 'on'];
const httpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class ApiPackageBookingController {
  constructor(models = {}, accountingService = null, db = null, bookingEmailService = null) {
    this.models = models;
    this.accountingService = accountingService;
    this.db = db;
    this.bookingEmailService = bookingEmailService;
    this.couponService = models.Coupon && models.CouponRedemption
      ? new CouponService({ Coupon: models.Coupon, CouponRedemption: models.CouponRedemption })
      : null;
  }

  isPaidPayload(payload = {}) {
    const status = clean(payload.status || payload.payment_status).toLowerCase();
    return Boolean(payload.razorpay_payment_id) || ['payment_verified', 'paid', 'success', 'captured', 'confirmed'].includes(status);
  }

  buildReference(packageId) {
    const stamp = Date.now().toString(36).toUpperCase();
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PT-PKG-${String(packageId || 'NA').padStart(4, '0')}-${stamp}${suffix}`;
  }

  getPaymentVerifiedAt(payload = {}) {
    if (payload.payment_verified_at) {
      const date = new Date(payload.payment_verified_at);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return this.isPaidPayload(payload) ? new Date() : null;
  }

  async findPackage(payload = {}) {
    const packageId = parseInt(payload.package_id || payload.packageId, 10);
    if (Number.isInteger(packageId) && packageId > 0) {
      return await this.models.Package.findByPk(packageId);
    }

    const slug = clean(payload.package_slug || payload.packageSlug);
    if (slug) {
      return await this.models.Package.findOne({ where: { slug } });
    }

    return null;
  }

  async resolveCustomerId(customer = {}) {
    if (!this.models.Customer) return null;

    if (isUuid(customer.id)) {
      const byCustomerId = await this.models.Customer.findByPk(customer.id);
      if (byCustomerId) return byCustomerId.id;

      const byUserId = await this.models.Customer.findOne({ where: { user_id: customer.id } });
      if (byUserId) return byUserId.id;
    }

    if (customer.email && this.models.User) {
      const user = await this.models.User.findOne({ where: { email: clean(customer.email).toLowerCase() } });
      if (user) {
        const profile = await this.models.Customer.findOne({ where: { user_id: user.id } });
        if (profile) return profile.id;
      }
    }

    return null;
  }

  async resolveCustomerContact(customer = {}) {
    const fallback = {
      id: isUuid(customer.id) ? customer.id : null,
      name: clean(customer.name),
      email: clean(customer.email).toLowerCase(),
      phone: clean(customer.phone || customer.phone_number)
    };

    if (!this.models.Customer) return fallback;

    const include = this.models.User
      ? [{ model: this.models.User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'phone_number'] }]
      : [];

    let profile = null;
    if (isUuid(customer.id)) {
      profile = await this.models.Customer.findByPk(customer.id, { include });
      if (!profile) {
        profile = await this.models.Customer.findOne({ where: { user_id: customer.id }, include });
      }
    }

    if (!profile && customer.email && this.models.User) {
      const user = await this.models.User.findOne({
        where: { email: clean(customer.email).toLowerCase() },
        attributes: ['id', 'name', 'email', 'phone_number']
      });
      if (user) {
        profile = await this.models.Customer.findOne({ where: { user_id: user.id }, include });
        if (!profile) {
          const plainUser = user.get ? user.get({ plain: true }) : user;
          return {
            id: null,
            name: fallback.name || clean(plainUser.name),
            email: fallback.email || clean(plainUser.email).toLowerCase(),
            phone: fallback.phone || clean(plainUser.phone_number)
          };
        }
      }
    }

    if (!profile) return fallback;

    const row = profile.get ? profile.get({ plain: true }) : profile;
    const user = row.user || {};
    return {
      id: row.id || fallback.id,
      name: fallback.name || clean(user.name),
      email: fallback.email || clean(user.email).toLowerCase(),
      phone: fallback.phone || clean(row.phone || user.phone_number)
    };
  }

  calculateAmounts(payload = {}, pkg = null, couponPreview = null) {
    const taxPercent = money(payload.tax_percent !== undefined ? payload.tax_percent : (pkg ? pkg.tax_percent : 0));
    const originalBaseAmount = money(
      payload.package_base_amount !== undefined
        ? payload.package_base_amount
        : (payload.package_price !== undefined ? payload.package_price : (pkg ? pkg.price : 0))
    );
    const couponDiscountAmount = money(couponPreview ? couponPreview.discount_amount : 0);
    const baseAmount = money(Math.max(originalBaseAmount - couponDiscountAmount, 0));
    const taxAmount = money(
      couponPreview
        ? (baseAmount * taxPercent / 100)
        : (payload.tax_amount !== undefined
        ? payload.tax_amount
        : (baseAmount * taxPercent / 100))
    );
    const packageTotal = money(
      couponPreview
        ? (baseAmount + taxAmount)
        : (payload.package_total !== undefined
        ? payload.package_total
        : (baseAmount + taxAmount))
    );
    const requestedPaidAmount = money(
      payload.payable_now !== undefined
        ? payload.payable_now
        : (this.isPaidPayload(payload) ? packageTotal : 0)
    );
    const paidAmount = money(Math.min(Math.max(requestedPaidAmount, 0), packageTotal));
    const remainingAmount = money(
      couponPreview
        ? Math.max(packageTotal - paidAmount, 0)
        : (payload.remaining_amount !== undefined
        ? payload.remaining_amount
        : Math.max(packageTotal - paidAmount, 0))
    );

    return { taxPercent, originalBaseAmount, baseAmount, couponDiscountAmount, taxAmount, packageTotal, paidAmount, remainingAmount };
  }

  calculateSplit(payload = {}, pkg = null, amounts = {}) {
    const hasVendor = Boolean(pkg && pkg.vendor_id);
    let basis = hasVendor ? 'package_base_amount' : 'no_vendor';
    let vendorAmount = 0;

    if (hasVendor) {
      const explicitVendorAmount = [
        payload.vendor_amount,
        payload.vendor_payable_amount,
        payload.vendor_share_amount
      ].find(value => value !== undefined && value !== null && value !== '');

      if (explicitVendorAmount !== undefined) {
        vendorAmount = money(explicitVendorAmount);
        basis = 'vendor_amount';
      } else if (payload.hotel_estimated_amount !== undefined && payload.hotel_estimated_amount !== null && payload.hotel_estimated_amount !== '') {
        vendorAmount = money(payload.hotel_estimated_amount);
        basis = 'hotel_estimated_amount';
      } else {
        vendorAmount = money(amounts.baseAmount);
      }
    }

    vendorAmount = Math.min(Math.max(vendorAmount, 0), money(amounts.baseAmount));
    const platformAmount = money(Math.max(money(amounts.baseAmount) - vendorAmount, 0));

    return { vendorAmount, platformAmount, basis };
  }

  getCouponCode(payload = {}) {
    return clean(
      payload.coupon_code ||
      payload.couponCode ||
      payload.promo_code ||
      payload.promoCode ||
      (payload.coupon && payload.coupon.code)
    );
  }

  async buildCouponPreview(payload = {}, pkg = null, customerId = null, customer = {}) {
    const code = this.getCouponCode(payload);
    if (!code) return null;
    if (!this.couponService) throw httpError('Coupons are not configured.', 500);

    const bookingAmount = money(
      payload.package_base_amount !== undefined
        ? payload.package_base_amount
        : (payload.package_price !== undefined ? payload.package_price : (pkg ? pkg.price : 0))
    );

    return this.couponService.validate({
      code,
      packageId: pkg ? pkg.id : (payload.package_id || payload.packageId),
      customerId,
      customerEmail: clean(customer.email || payload.customer_email || payload.email).toLowerCase(),
      bookingAmount
    });
  }

  buildCouponSnapshot(couponPreview = null, amounts = {}) {
    if (!couponPreview || !couponPreview.coupon) return {};
    const coupon = this.couponService && typeof this.couponService.serializeCoupon === 'function'
      ? this.couponService.serializeCoupon(couponPreview.coupon)
      : couponPreview.coupon;

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value || 0),
      max_discount_amount: coupon.max_discount_amount,
      minimum_booking_amount: Number(coupon.minimum_booking_amount || 0),
      valid_from: coupon.valid_from || null,
      valid_until: coupon.valid_until || null,
      booking_amount: Number(amounts.originalBaseAmount || couponPreview.booking_amount || 0),
      discount_amount: Number(amounts.couponDiscountAmount || couponPreview.discount_amount || 0),
      amount_after_discount: Number(amounts.baseAmount || couponPreview.amount_after_discount || 0),
      applied_at: new Date().toISOString()
    };
  }

  serializeCouponForBooking(row = {}) {
    const discountAmount = Number(row.coupon_discount_amount || 0);
    const snapshot = row.coupon_snapshot || {};
    if (!row.coupon_id && !row.coupon_code && !snapshot.code && discountAmount <= 0) return null;

    return {
      id: row.coupon_id || snapshot.id || null,
      code: row.coupon_code || snapshot.code || null,
      name: snapshot.name || null,
      discount_type: snapshot.discount_type || null,
      discount_value: snapshot.discount_value !== undefined ? Number(snapshot.discount_value || 0) : null,
      discount_amount: discountAmount,
      booking_amount: snapshot.booking_amount !== undefined ? Number(snapshot.booking_amount || 0) : null,
      amount_after_discount: snapshot.amount_after_discount !== undefined ? Number(snapshot.amount_after_discount || 0) : null,
      snapshot
    };
  }

  isPrivilegedUser(user = {}) {
    const type = normalizeAccessValue(user.type);
    const roleValue = typeof user.role === 'string' ? user.role : (user.role && user.role.name);
    const roleName = normalizeAccessValue(user.role_name || user.roleName || roleValue);
    return ['admin', 'manager', 'super_admin'].includes(type) || ['admin', 'manager', 'super_admin'].includes(roleName);
  }

  isRefundApprover(user = {}) {
    const type = normalizeAccessValue(user.type);
    const roleValue = typeof user.role === 'string' ? user.role : (user.role && user.role.name);
    const roleName = normalizeAccessValue(user.role_name || user.roleName || roleValue);
    return refundAllowedRoles.includes(type) || refundAllowedRoles.includes(roleName);
  }

  async getAuthoritativeUser(user = {}) {
    if (!user || !user.id || !this.models.User) return user;

    const include = this.models.Role
      ? [{ model: this.models.Role, as: 'role', attributes: ['id', 'name'] }]
      : [];

    try {
      const dbUser = await this.models.User.findByPk(user.id, {
        include,
        attributes: ['id', 'name', 'email', 'type', 'role_id', 'status']
      });
      if (!dbUser || dbUser.status === false) return null;

      const plainUser = dbUser.get ? dbUser.get({ plain: true }) : dbUser;
      return {
        ...plainUser,
        role_name: plainUser.role ? plainUser.role.name : plainUser.role_name
      };
    } catch (error) {
      console.error('Package refund role lookup error:', error.message);
      return null;
    }
  }

  async canProcessPackageRefund(user = {}) {
    const authoritativeUser = await this.getAuthoritativeUser(user);
    return this.isRefundApprover(authoritativeUser || {});
  }

  async findBooking(ref, options = {}) {
    const bookingRef = clean(ref);
    if (!bookingRef || !this.models.PackageBooking) return null;

    const include = options.include || [];
    if (isUuid(bookingRef)) {
      return await this.models.PackageBooking.findByPk(bookingRef, { include });
    }
    return await this.models.PackageBooking.findOne({ where: { booking_reference: bookingRef }, include });
  }

  async ensureBookingAccess(booking, req, { adminOnly = false } = {}) {
    const user = req.user || {};
    const userId = user.id ? String(user.id) : '';
    const userType = clean(user.type).toLowerCase();
    const isPrivileged = this.isPrivilegedUser(user);

    if (adminOnly) {
      return await this.canProcessPackageRefund(user);
    }

    if (isPrivileged) return true;
    if (userType === 'vendor' && booking.vendor_id && String(booking.vendor_id) === userId) return true;
    if (user.email && booking.customer_email && clean(user.email).toLowerCase() === clean(booking.customer_email).toLowerCase()) return true;

    if (this.models.Customer && userId) {
      const customer = await this.models.Customer.findOne({ where: { user_id: userId, id: booking.customer_id } });
      if (customer) return true;
    }

    return false;
  }

  async ensureCustomerReturnRequestAccess(booking, req) {
    const user = req.user || {};
    const userId = user.id ? String(user.id) : '';

    if (this.isPrivilegedUser(user)) return true;
    if (user.email && booking.customer_email && clean(user.email).toLowerCase() === clean(booking.customer_email).toLowerCase()) return true;

    if (this.models.Customer && userId) {
      const customer = await this.models.Customer.findOne({ where: { user_id: userId, id: booking.customer_id } });
      if (customer) return true;
    }

    return false;
  }

  sumRawAmounts(raw = {}, key, amountKey) {
    const rows = Array.isArray(raw[key]) ? raw[key] : [];
    return rows.reduce((sum, item) => sum + money(item && item[amountKey]), 0);
  }

  allocateRefundReversal(booking, reverseTotal) {
    const raw = booking.raw_payload || {};
    const original = {
      vendor_amount: money(booking.vendor_amount),
      platform_amount: money(booking.platform_amount),
      tax_amount: money(booking.tax_amount)
    };
    const prior = (Array.isArray(raw.refunds) ? raw.refunds : []).reduce((acc, refund) => {
      const allocation = refund.allocation || {};
      acc.vendor_amount += money(allocation.vendor_amount);
      acc.platform_amount += money(allocation.platform_amount);
      acc.tax_amount += money(allocation.tax_amount);
      return acc;
    }, { vendor_amount: 0, platform_amount: 0, tax_amount: 0 });
    const available = {
      vendor_amount: Math.max(money(original.vendor_amount - prior.vendor_amount), 0),
      platform_amount: Math.max(money(original.platform_amount - prior.platform_amount), 0),
      tax_amount: Math.max(money(original.tax_amount - prior.tax_amount), 0)
    };
    const originalTotal = money(original.vendor_amount + original.platform_amount + original.tax_amount);
    const target = Math.min(money(reverseTotal), money(available.vendor_amount + available.platform_amount + available.tax_amount));

    let allocation = {
      vendor_amount: originalTotal > 0 ? money(target * original.vendor_amount / originalTotal) : 0,
      platform_amount: originalTotal > 0 ? money(target * original.platform_amount / originalTotal) : target,
      tax_amount: originalTotal > 0 ? money(target * original.tax_amount / originalTotal) : 0
    };

    Object.keys(allocation).forEach(key => {
      allocation[key] = Math.min(allocation[key], available[key]);
    });

    let difference = money(target - (allocation.vendor_amount + allocation.platform_amount + allocation.tax_amount));
    ['platform_amount', 'vendor_amount', 'tax_amount'].forEach(key => {
      if (difference <= 0) return;
      const room = money(available[key] - allocation[key]);
      const add = Math.min(room, difference);
      allocation[key] = money(allocation[key] + add);
      difference = money(difference - add);
    });

    return allocation;
  }

  isFalseFlag(value) {
    if (value === false || value === 0) return true;
    return typeof value === 'string' && falseFlags.includes(value.trim().toLowerCase());
  }

  isTrueFlag(value) {
    if (value === true || value === 1) return true;
    return typeof value === 'string' && trueFlags.includes(value.trim().toLowerCase());
  }

  shouldApplyCancellationRule(payload = {}) {
    const applyValue = payload.apply_cancellation_rule ?? payload.use_cancellation_rule ?? payload.apply_rule;
    if (applyValue !== undefined) return !this.isFalseFlag(applyValue);

    const manualValue = payload.manual_refund ?? payload.override_cancellation_rule ?? payload.override_refund;
    if (manualValue !== undefined) return !this.isTrueFlag(manualValue);

    return Boolean(this.models.CancellationRule);
  }

  clampPercentage(value) {
    return Math.min(Math.max(money(value), 0), 100);
  }

  getCancellationRulePercentages(rule = {}) {
    const configuredRefundPercentage = this.clampPercentage(rule.refund_percentage);
    const configuredCancellationPercentage = this.clampPercentage(rule.cancellation_percentage);
    const explicitReturnPercentage = rule.return_percentage !== undefined
      ? this.clampPercentage(rule.return_percentage)
      : (rule.refundable_percentage !== undefined ? this.clampPercentage(rule.refundable_percentage) : null);
    const returnPercentage = explicitReturnPercentage !== null
      ? explicitReturnPercentage
      : configuredRefundPercentage > 0
      ? configuredRefundPercentage
      : configuredCancellationPercentage;
    const retainedPercentage = this.clampPercentage(100 - returnPercentage);

    return {
      configured_refund_percentage: configuredRefundPercentage,
      configured_cancellation_percentage: configuredCancellationPercentage,
      return_percentage: this.clampPercentage(returnPercentage),
      retained_percentage: retainedPercentage,
      non_refundable_percentage: retainedPercentage
    };
  }

  normalizeCancellationRuleSnapshot(rule = {}, payload = {}) {
    if (!rule || typeof rule !== 'object') return null;
    const hasRulePercent = rule.return_percentage !== undefined
      || rule.refundable_percentage !== undefined
      || rule.refund_percentage !== undefined
      || rule.cancellation_percentage !== undefined;
    if (!hasRulePercent) return null;

    const baseRule = {
      ...rule,
      applied: rule.applied !== false,
      departure_date: rule.departure_date || payload.departure_date || null
    };
    return {
      ...baseRule,
      ...this.getCancellationRulePercentages(baseRule)
    };
  }

  parseDateValue(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      const date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatDateOnly(date) {
    if (!date || Number.isNaN(date.getTime())) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  findDepartureDateInValue(value, depth = 0) {
    if (!value || depth > 4 || typeof value !== 'object') return null;

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = this.findDepartureDateInValue(item, depth + 1);
        if (found) return found;
      }
      return null;
    }

    for (const key of cancellationDateKeys) {
      if (value[key] === undefined || value[key] === null || value[key] === '') continue;
      const parsed = this.parseDateValue(value[key]);
      if (parsed) return { date: parsed, source: key, raw: value[key] };
      const nested = this.findDepartureDateInValue(value[key], depth + 1);
      if (nested) return nested;
    }

    for (const key of Object.keys(value)) {
      if (!value[key] || typeof value[key] !== 'object') continue;
      const found = this.findDepartureDateInValue(value[key], depth + 1);
      if (found) return found;
    }

    return null;
  }

  getDepartureDateContext(booking, payload = {}) {
    const raw = booking && booking.raw_payload ? booking.raw_payload : {};
    for (const source of [payload, raw]) {
      const found = this.findDepartureDateInValue(source);
      if (found) {
        return {
          ...found,
          date_only: this.formatDateOnly(found.date)
        };
      }
    }
    return null;
  }

  getDaysBeforeDeparture(departureDate, now = new Date()) {
    if (!departureDate || Number.isNaN(departureDate.getTime())) return null;
    const departureStart = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(Math.ceil((departureStart.getTime() - todayStart.getTime()) / dayMs), 0);
  }

  async getCancellationRuleContext(booking, payload = {}) {
    const departure = this.getDepartureDateContext(booking, payload);
    if (!departure) {
      return { applied: false, missing_departure_date: true };
    }

    const daysBeforeDeparture = this.getDaysBeforeDeparture(departure.date);
    if (!this.models.CancellationRule) {
      return {
        applied: false,
        missing_rule_model: true,
        departure_date: departure.date_only,
        days_before_departure: daysBeforeDeparture
      };
    }

    const Op = this.models.CancellationRule.sequelize.Sequelize.Op;
    const rule = await this.models.CancellationRule.findOne({
      where: {
        is_active: true,
        min_days_before_departure: { [Op.lte]: daysBeforeDeparture },
        max_days_before_departure: { [Op.gte]: daysBeforeDeparture }
      },
      order: [['min_days_before_departure', 'DESC']]
    });

    if (!rule) {
      return {
        applied: false,
        missing_rule: true,
        departure_date: departure.date_only,
        days_before_departure: daysBeforeDeparture
      };
    }

    const plainRule = rule.get ? rule.get({ plain: true }) : rule;
    const percentages = this.getCancellationRulePercentages(plainRule);
    return {
      applied: true,
      rule_id: plainRule.id,
      departure_date: departure.date_only,
      days_before_departure: daysBeforeDeparture,
      refund_percentage: money(plainRule.refund_percentage),
      cancellation_percentage: money(plainRule.cancellation_percentage),
      ...percentages,
      description: plainRule.description || null
    };
  }

  serializeCancellationRule(rule) {
    const row = rule && rule.get ? rule.get({ plain: true }) : rule;
    if (!row) return null;
    const percentages = this.getCancellationRulePercentages(row);
    return {
      id: row.id,
      min_days_before_departure: Number(row.min_days_before_departure || 0),
      max_days_before_departure: Number(row.max_days_before_departure || 0),
      refund_percentage: Number(row.refund_percentage || 0),
      cancellation_percentage: Number(row.cancellation_percentage || 0),
      ...percentages,
      description: row.description || null,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async listCancellationRules(req, res) {
    try {
      if (!this.models.CancellationRule) {
        return res.status(500).json({ success: false, message: 'Cancellation rules are not configured.' });
      }

      const rows = await this.models.CancellationRule.findAll({
        where: { is_active: true },
        order: [
          ['min_days_before_departure', 'ASC'],
          ['max_days_before_departure', 'ASC']
        ]
      });

      return res.json({
        success: true,
        data: rows.map(row => this.serializeCancellationRule(row))
      });
    } catch (error) {
      console.error('Cancellation rules API error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async buildReturnRequestPreview(booking, payload = {}) {
    if (!booking) throw httpError('Package booking not found.', 404);
    if (booking.accounting_status !== 'recorded') {
      throw httpError('Original booking accounting is not recorded yet.');
    }

    const raw = booking.raw_payload || {};
    if (raw.return_status === 'closed') {
      throw httpError('Package return is already closed for this booking.');
    }

    const cancellationRule = await this.getCancellationRuleContext(booking, payload);
    if (!cancellationRule || cancellationRule.missing_departure_date) {
      throw httpError('Departure date is required to apply cancellation rule.');
    }
    if (!cancellationRule.applied) {
      throw httpError(`No active cancellation rule found for ${cancellationRule.days_before_departure} days before departure.`);
    }

    const currentPaid = money(booking.paid_amount);
    const currentRemaining = money(booking.remaining_amount);
    const rulePercentages = this.getCancellationRulePercentages(cancellationRule);
    const refundAmount = money(currentPaid * rulePercentages.return_percentage / 100);
    const cancelRemainingAmount = this.isFalseFlag(payload.cancel_remaining)
      ? 0
      : (payload.cancel_remaining_amount !== undefined ? money(payload.cancel_remaining_amount) : currentRemaining);

    if (refundAmount < 0 || cancelRemainingAmount < 0) {
      throw httpError('Refund and cancellation amounts cannot be negative.');
    }
    if (refundAmount - currentPaid > 0.01) {
      throw httpError('Refund amount cannot be greater than paid amount.');
    }
    if (cancelRemainingAmount - currentRemaining > 0.01) {
      throw httpError('Cancellation amount cannot be greater than remaining amount.');
    }

    return {
      current_paid_amount: currentPaid,
      current_remaining_amount: currentRemaining,
      refund_amount: refundAmount,
      cancel_remaining_amount: cancelRemainingAmount,
      retained_amount: money(currentPaid - refundAmount),
      cancellation_rule: { ...cancellationRule, ...rulePercentages },
      departure_date: cancellationRule.departure_date
    };
  }

  async settlePackageReturn(booking, payload = {}, userId = null, transaction = null) {
    if (!booking) throw httpError('Package booking not found.', 404);
    if (booking.accounting_status !== 'recorded') {
      throw httpError('Original booking accounting is not recorded yet.');
    }

    const raw = booking.raw_payload || {};
    if (raw.return_status === 'closed') {
      throw httpError('Package return is already closed for this booking.');
    }

    const currentPaid = money(booking.paid_amount);
    const currentRemaining = money(booking.remaining_amount);
    const applyCancellationRule = this.shouldApplyCancellationRule(payload);
    const snapshotRule = payload.cancellation_rule_snapshot || payload.cancellation_rule || null;
    const cancellationRule = applyCancellationRule
      ? (this.normalizeCancellationRuleSnapshot(snapshotRule, payload) || await this.getCancellationRuleContext(booking, payload))
      : null;

    if (applyCancellationRule && this.models.CancellationRule) {
      if (!cancellationRule || cancellationRule.missing_departure_date) {
        throw httpError('Departure date is required to apply cancellation rule.');
      }
      if (!cancellationRule.applied) {
        throw httpError(`No active cancellation rule found for ${cancellationRule.days_before_departure} days before departure.`);
      }
    }

    const rulePercentages = cancellationRule && cancellationRule.applied
      ? this.getCancellationRulePercentages(cancellationRule)
      : null;
    const refundAmount = cancellationRule && cancellationRule.applied
      ? money(currentPaid * rulePercentages.return_percentage / 100)
      : money(payload.refund_amount !== undefined ? payload.refund_amount : (payload.amount !== undefined ? payload.amount : currentPaid));
    const cancelRemainingAmount = cancellationRule && cancellationRule.applied
      ? (this.isFalseFlag(payload.cancel_remaining) ? 0 : (payload.cancel_remaining_amount !== undefined ? money(payload.cancel_remaining_amount) : currentRemaining))
      : (payload.cancel_remaining_amount !== undefined
        ? money(payload.cancel_remaining_amount)
        : (this.isFalseFlag(payload.cancel_remaining) ? 0 : currentRemaining));

    if (refundAmount < 0 || cancelRemainingAmount < 0) {
      throw httpError('Refund and cancellation amounts cannot be negative.');
    }
    if (refundAmount - currentPaid > 0.01) {
      throw httpError('Refund amount cannot be greater than paid amount.');
    }
    if (cancelRemainingAmount - currentRemaining > 0.01) {
      throw httpError('Cancellation amount cannot be greater than remaining amount.');
    }
    if (refundAmount + cancelRemainingAmount <= 0 && !(cancellationRule && cancellationRule.applied)) {
      throw httpError('Refund or cancellation amount is required.');
    }

    const refunds = Array.isArray(raw.refunds) ? raw.refunds : [];
    const refundReference = clean(payload.refund_reference || payload.razorpay_refund_id || payload.refund_id || payload.transaction_id || payload.reference);
    if (refundReference && refunds.some(item => clean(item.reference) === refundReference || clean(item.razorpay_refund_id) === refundReference)) {
      return {
        already_recorded: true,
        message: 'Refund already recorded.',
        booking,
        refund: null
      };
    }

    const reversalAmount = money(refundAmount + cancelRemainingAmount);
    const allocation = this.allocateRefundReversal(booking, reversalAmount);
    const reason = clean(payload.reason || payload.return_reason || payload.notes);

    const accountingEntry = reversalAmount > 0 && this.accountingService && typeof this.accountingService.recordPackageRefund === 'function'
      ? await this.accountingService.recordPackageRefund({
        bookingId: booking.id,
        bookingRef: booking.booking_reference,
        refundAmount,
        cancelRemainingAmount,
        vendorReversal: allocation.vendor_amount,
        revenueReversal: allocation.platform_amount,
        taxReversal: allocation.tax_amount,
        refundReference,
        reason
      }, userId, transaction)
      : null;

    const refundedAt = payload.refunded_at ? new Date(payload.refunded_at) : new Date();
    const newPaidAmount = money(Math.max(currentPaid - refundAmount, 0));
    const newRemainingAmount = money(Math.max(currentRemaining - cancelRemainingAmount, 0));
    const ruleApplied = Boolean(cancellationRule && cancellationRule.applied);
    const returnClosed = newRemainingAmount <= 0 && (ruleApplied || newPaidAmount <= 0);
    let paymentStatus = booking.payment_status;
    if (ruleApplied && newRemainingAmount <= 0) {
      if (refundAmount > 0 && newPaidAmount <= 0) {
        paymentStatus = 'refunded';
      } else if (refundAmount > 0) {
        paymentStatus = 'partially_refunded';
      } else {
        paymentStatus = 'cancelled';
      }
    } else if (newPaidAmount <= 0 && newRemainingAmount <= 0) {
      paymentStatus = refundAmount > 0 ? 'refunded' : 'cancelled';
    } else if (refundAmount > 0) {
      paymentStatus = 'partially_refunded';
    } else if (cancelRemainingAmount > 0) {
      paymentStatus = 'partially_cancelled';
    }

    const refundSnapshot = {
      refund_amount: refundAmount,
      cancel_remaining_amount: cancelRemainingAmount,
      retained_amount: ruleApplied ? money(currentPaid - refundAmount) : null,
      retained_percentage: ruleApplied ? rulePercentages.retained_percentage : null,
      return_percentage: ruleApplied ? rulePercentages.return_percentage : null,
      reference: refundReference || null,
      razorpay_refund_id: clean(payload.razorpay_refund_id) || null,
      reason: reason || null,
      cancellation_rule: ruleApplied ? { ...cancellationRule, ...rulePercentages } : null,
      allocation,
      journal_entry_id: accountingEntry ? accountingEntry.id : null,
      refunded_at: Number.isNaN(refundedAt.getTime()) ? new Date().toISOString() : refundedAt.toISOString()
    };

    await booking.update({
      paid_amount: newPaidAmount,
      remaining_amount: newRemainingAmount,
      payment_status: paymentStatus,
      accounting_status: accountingEntry ? 'recorded' : booking.accounting_status,
      raw_payload: {
        ...raw,
        return_status: returnClosed ? 'closed' : 'partial',
        refunds: [...refunds, refundSnapshot]
      }
    }, { transaction });

    const freshBooking = await this.models.PackageBooking.findByPk(booking.id, { transaction });
    return {
      already_recorded: false,
      message: accountingEntry ? 'Package return/refund recorded in accounting.' : 'Package return recorded with cancellation rule.',
      booking: freshBooking || booking,
      refund: refundSnapshot
    };
  }

  async confirm(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageBooking || !this.models.Package || !this.db) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const payload = req.body || {};
      const pkg = await this.findPackage(payload);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found for this booking.' });
      }

      const existingPayment = clean(payload.razorpay_payment_id);
      if (existingPayment) {
        const existing = await this.models.PackageBooking.findOne({ where: { razorpay_payment_id: existingPayment } });
        if (existing) {
          return res.json({
            success: true,
            message: 'Package booking already recorded.',
            data: this.serializeBooking(existing)
          });
        }
      }

      const payloadCustomer = payload.customer || {};
      const customer = {
        ...payloadCustomer,
        ...(req.user ? {
          id: payloadCustomer.id || req.user.id,
          name: payloadCustomer.name || req.user.name,
          email: payloadCustomer.email || req.user.email
        } : {})
      };
      const resolvedContact = await this.resolveCustomerContact(customer);
      const customerId = resolvedContact.id || await this.resolveCustomerId(customer);
      const bookingCustomer = {
        id: customerId,
        name: clean(customer.name) || resolvedContact.name,
        email: clean(customer.email).toLowerCase() || resolvedContact.email,
        phone: clean(customer.phone) || resolvedContact.phone
      };
      const couponPreview = await this.buildCouponPreview(payload, pkg, customerId, bookingCustomer);
      const amounts = this.calculateAmounts(payload, pkg, couponPreview);
      const split = this.calculateSplit(payload, pkg, amounts);
      const couponSnapshot = this.buildCouponSnapshot(couponPreview, amounts);
      const isPaid = this.isPaidPayload(payload);
      const bookingReference = this.buildReference(pkg.id);
      const rawPayload = {
        ...payload,
        coupon: couponPreview ? couponSnapshot : null,
        pricing: {
          ...(payload.pricing || {}),
          original_package_base_amount: amounts.originalBaseAmount,
          coupon_discount_amount: amounts.couponDiscountAmount,
          package_base_amount_after_coupon: amounts.baseAmount,
          tax_percent: amounts.taxPercent,
          tax_amount: amounts.taxAmount,
          package_total: amounts.packageTotal,
          paid_amount: amounts.paidAmount,
          remaining_amount: amounts.remainingAmount
        }
      };

      transaction = await this.db.transaction();

        const booking = await this.models.PackageBooking.create({
        booking_reference: bookingReference,
        package_id: pkg.id,
        package_slug: clean(payload.package_slug) || pkg.slug || null,
        package_name: clean(payload.package_name) || pkg.name || null,
        vendor_id: pkg.vendor_id || null,
        customer_id: customerId,
        customer_name: bookingCustomer.name || null,
        customer_email: bookingCustomer.email || null,
        customer_phone: bookingCustomer.phone || null,
        package_base_amount: amounts.baseAmount,
        tax_type: clean(payload.tax_type) || pkg.tax_type || null,
        tax_percent: amounts.taxPercent,
        tax_amount: amounts.taxAmount,
        package_total: amounts.packageTotal,
        paid_amount: amounts.paidAmount,
        remaining_amount: amounts.remainingAmount,
        coupon_id: couponPreview ? couponPreview.coupon.id : null,
        coupon_code: couponPreview ? couponPreview.coupon.code : null,
        coupon_discount_amount: amounts.couponDiscountAmount,
        coupon_snapshot: couponPreview ? couponSnapshot : {},
        vendor_amount: split.vendorAmount,
        platform_amount: split.platformAmount,
        vendor_split_basis: split.basis,
        partial_booking_enabled: Boolean(payload.partial_booking_enabled),
        partial_booking_percentage: money(payload.partial_booking_percentage),
        payment_status: clean(payload.status || payload.payment_status) || (isPaid ? 'payment_verified' : 'pending'),
        razorpay_order_id: clean(payload.razorpay_order_id) || null,
        razorpay_payment_id: existingPayment || null,
        payment_verified_at: this.getPaymentVerifiedAt(payload),
        accounting_status: isPaid ? 'pending' : 'skipped',
        page_url: cleanUrl(payload.page_url) || null,
        raw_payload: rawPayload
      }, { transaction });

      // Create a Notification for the new package booking
      try {
        const { Notification } = require('../container').models;
        if (Notification) {
            await Notification.create({
                title: 'New Package Booking',
                message: `A new package booking has been made. Package: ${pkg.name}`,
                type: 'new_booking',
                reference_id: booking.id
            }, { transaction });
        }
      } catch (notifErr) {
        console.error("Error creating Notification for package booking:", notifErr);
      }

      if (couponPreview) {
        await this.couponService.redeem({
          coupon: couponPreview.coupon,
          booking,
          customerId,
          customerEmail: booking.customer_email,
          bookingAmount: amounts.originalBaseAmount,
          discountAmount: amounts.couponDiscountAmount,
          transaction
        });
      }

      let accountingEntry = null;
      if (isPaid && this.accountingService && typeof this.accountingService.recordPackageBookingSplit === 'function') {
        accountingEntry = await this.accountingService.recordPackageBookingSplit({
          bookingId: booking.id,
          bookingRef: booking.booking_reference,
          packageName: booking.package_name,
          paidAmount: amounts.paidAmount,
          remainingAmount: amounts.remainingAmount,
          taxAmount: amounts.taxAmount,
          vendorAmount: split.vendorAmount,
          platformAmount: split.platformAmount,
          vendorId: pkg.vendor_id || null
        }, req.user ? req.user.id : null, transaction);

        await booking.update({
          accounting_status: accountingEntry ? 'recorded' : 'skipped',
          accounting_entry_id: accountingEntry ? accountingEntry.id : null
        }, { transaction });
      }

      // Save passenger rows for the booking.
      const rawPassengers = Array.isArray(payload.passengers) ? payload.passengers : [];
      const passengerRows = rawPassengers
        .filter(p => p && clean(p.full_name || p.name))
        .map((p, index) => ({
          booking_id: booking.id,
          full_name: clean(p.full_name || p.name),
          age: p.age !== undefined && p.age !== null && p.age !== '' ? parseInt(p.age, 10) || null : null,
          gender: ['male', 'female', 'other'].includes(String(p.gender || '').toLowerCase()) ? String(p.gender).toLowerCase() : null,
          dob: p.dob || null,
          nationality: clean(p.nationality) || null,
          passport_no: clean(p.passport_no || p.passport_number) || null,
          passport_expiry: p.passport_expiry || null,
          is_lead: index === 0 || Boolean(p.is_lead)
        }));

      // Auto-create a lead passenger from customer if none provided.
      if (passengerRows.length === 0 && clean(bookingCustomer.name)) {
        passengerRows.push({
          booking_id: booking.id,
          full_name: clean(bookingCustomer.name),
          age: null,
          gender: null,
          dob: null,
          nationality: null,
          passport_no: null,
          passport_expiry: null,
          is_lead: true
        });
      }

      if (passengerRows.length > 0 && this.models.BookingPassenger) {
        await this.models.BookingPassenger.bulkCreate(passengerRows, { transaction });
      }

      await transaction.commit();

      transaction = null;

      const freshBooking = await this.models.PackageBooking.findByPk(booking.id, {
        include: this.models.BookingPassenger
          ? [{ model: this.models.BookingPassenger, as: 'passengers' }]
          : []
      });
      let itineraryEmail = null;
      if (this.bookingEmailService && typeof this.bookingEmailService.enqueuePackageBookingItinerary === 'function') {
        try {
          const queuedEmail = await this.bookingEmailService.enqueuePackageBookingItinerary(freshBooking || booking);
          itineraryEmail = queuedEmail ? {
            id: queuedEmail.id,
            status: queuedEmail.status,
            recipient_email: queuedEmail.recipient_email,
            scheduled_at: queuedEmail.scheduled_at
          } : null;
        } catch (emailError) {
          console.error('Booking itinerary email queue error:', emailError.message);
        }
      }

      const bookingData = (freshBooking || booking).get ? (freshBooking || booking).get({ plain: true }) : (freshBooking || booking);

      return res.status(201).json({
        success: true,
        message: pkg.vendor_id ? 'Package booking recorded and vendor split added to accounting.' : 'Package booking recorded without vendor split.',
        data: {
          ...bookingData,
          passengers: (bookingData.passengers || []).map(p => ({
            id: p.id,
            full_name: p.full_name,
            age: p.age,
            gender: p.gender,
            dob: p.dob,
            nationality: p.nationality,
            passport_no: p.passport_no,
            passport_expiry: p.passport_expiry,
            is_lead: p.is_lead
          })),
          itinerary_email: itineraryEmail
        }
      });

    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error('Package booking confirm error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async createBooking(req, res) {
    return this.confirm(req, res);
  }

  async validateCoupon(req, res) {
    try {
      if (!this.models.Package) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const payload = req.body || {};
      const pkg = await this.findPackage(payload);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package not found for this coupon.' });
      }

      const customer = {
        ...(payload.customer || {}),
        ...(req.user ? {
          id: req.user.id || (payload.customer || {}).id,
          name: req.user.name || (payload.customer || {}).name,
          email: req.user.email || (payload.customer || {}).email
        } : {})
      };
      const customerId = await this.resolveCustomerId(customer);
      const couponPreview = await this.buildCouponPreview(payload, pkg, customerId, customer);
      if (!couponPreview) {
        return res.status(400).json({ success: false, message: 'Coupon code is required.' });
      }

      const amounts = this.calculateAmounts(payload, pkg, couponPreview);

      return res.json({
        success: true,
        message: 'Coupon is valid.',
        data: {
          coupon: this.couponService.serializeCoupon(couponPreview.coupon),
          discount: {
            booking_amount: couponPreview.booking_amount,
            discount_amount: amounts.couponDiscountAmount,
            amount_after_discount: amounts.baseAmount
          },
          amounts: {
            original_package_base_amount: amounts.originalBaseAmount,
            package_base_amount: amounts.baseAmount,
            coupon_discount_amount: amounts.couponDiscountAmount,
            tax_percent: amounts.taxPercent,
            tax_amount: amounts.taxAmount,
            package_total: amounts.packageTotal,
            paid_amount: amounts.paidAmount,
            remaining_amount: amounts.remainingAmount
          }
        }
      });
    } catch (error) {
      console.error('Package coupon validation error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async listByCustomer(req, res) {
    try {
      if (!this.models.PackageBooking) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const customerRef = clean(req.params.customer_id || req.query.customer_id || req.query.customerId);
      if (!customerRef) {
        return res.status(400).json({ success: false, message: 'customer_id is required' });
      }

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
      const status = clean(req.query.status || req.query.payment_status);
      const Op = this.models.PackageBooking.sequelize.Sequelize.Op;
      const Customer = this.models.Customer;
      const User = this.models.User;
      const Package = this.models.Package;
      const BookingPassenger = this.models.BookingPassenger || this.models.PackageBooking.associations.passengers?.target;
      const authUser = req.user || {};
      const authUserType = clean(authUser.type).toLowerCase();
      const privilegedTypes = ['admin', 'manager', 'super_admin'];
      const isPrivileged = privilegedTypes.includes(authUserType);

      const targetCustomerIds = [];
      let targetUserId = null;
      let targetEmail = '';
      let targetCustomer = null;
      let targetUser = null;

      if (Customer && isUuid(customerRef)) {
        targetCustomer = await Customer.findByPk(customerRef, {
          include: User ? [{ model: User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'type'] }] : []
        });
        if (targetCustomer) {
          targetCustomerIds.push(targetCustomer.id);
          targetUserId = targetCustomer.user_id || null;
          targetEmail = targetCustomer.user ? targetCustomer.user.email : '';
        }
      }

      if (User && isUuid(customerRef)) {
        targetUser = await User.findByPk(customerRef, { attributes: ['id', 'name', 'email', 'type'] });
        if (targetUser) {
          targetUserId = targetUser.id;
          targetEmail = targetUser.email || targetEmail;
          if (Customer) {
            const profiles = await Customer.findAll({ where: { user_id: targetUser.id }, attributes: ['id', 'user_id', 'phone'] });
            profiles.forEach(profile => targetCustomerIds.push(profile.id));
          }
        }
      }

      if (!targetEmail && customerRef.includes('@')) {
        targetEmail = customerRef.toLowerCase();
        if (User) {
          targetUser = await User.findOne({ where: { email: targetEmail }, attributes: ['id', 'name', 'email', 'type'] });
          if (targetUser) {
            targetUserId = targetUser.id;
            if (Customer) {
              const profiles = await Customer.findAll({ where: { user_id: targetUser.id }, attributes: ['id', 'user_id', 'phone'] });
              profiles.forEach(profile => targetCustomerIds.push(profile.id));
            }
          }
        }
      }

      const uniqueCustomerIds = [...new Set(targetCustomerIds.filter(Boolean))];
      const authCustomerIds = Customer && authUser.id
        ? (await Customer.findAll({ where: { user_id: authUser.id }, attributes: ['id'] })).map(profile => profile.id)
        : [];
      const isOwnCustomer = (
        String(customerRef) === String(authUser.id || '') ||
        String(targetUserId || '') === String(authUser.id || '') ||
        uniqueCustomerIds.some(id => authCustomerIds.includes(id)) ||
        (targetEmail && authUser.email && targetEmail.toLowerCase() === String(authUser.email).toLowerCase())
      );

      if (!isPrivileged && authUserType !== 'vendor' && !isOwnCustomer) {
        return res.status(403).json({ success: false, message: 'You can only view your own bookings.' });
      }

      const identityConditions = [];
      if (uniqueCustomerIds.length) {
        identityConditions.push({ customer_id: { [Op.in]: uniqueCustomerIds } });
      }
      if (isUuid(customerRef)) {
        identityConditions.push({ customer_id: customerRef });
      }
      if (targetEmail) {
        identityConditions.push({ customer_email: targetEmail.toLowerCase() });
      }

      if (!identityConditions.length) {
        return res.json({
          success: true,
          data: {
            customer_id: customerRef,
            customer_ids: [],
            total: 0,
            page,
            limit,
            total_pages: 0,
            totals: {
              package_total: 0,
              paid_amount: 0,
              remaining_amount: 0
            },
            rows: []
          }
        });
      }

      const where = { [Op.or]: identityConditions };
      if (status) where.payment_status = status;
      if (authUserType === 'vendor' && !isPrivileged) where.vendor_id = authUser.id;

      const include = [
        Package ? {
          model: Package,
          as: 'package',
          required: false,
          attributes: [
            'id', 'name', 'slug', 'sort_order', 'travel_type', 'duration_days',
            'departure_city', 'price', 'discount_percentage', 'tax_type', 'tax_percent',
            'status', 'show_in_home_page', 'is_customizable', 'description',
            'meta_title', 'meta_description', 'meta_keyword', 'schema', 'vendor_id',
            'main_image', 'main_image_alt', 'created_at', 'updated_at'
          ]
        } : null,
        Customer ? {
          model: Customer,
          as: 'customer',
          required: false,
          attributes: ['id', 'user_id', 'phone', 'address', 'city', 'state', 'pincode'],
          include: User ? [{ model: User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'phone_number', 'type', 'status'] }] : []
        } : null,
        User ? { model: User, as: 'vendor', required: false, attributes: ['id', 'name', 'email', 'phone_number', 'type', 'status'] } : null,
        BookingPassenger ? { model: BookingPassenger, as: 'passengers', required: false } : null
      ].filter(Boolean);

      const [result, packageTotal, paidTotal, remainingTotal] = await Promise.all([
        this.models.PackageBooking.findAndCountAll({
          where,
          include,
          limit,
          offset: (page - 1) * limit,
          order: [['created_at', 'DESC']]
        }),
        this.models.PackageBooking.sum('package_total', { where }),
        this.models.PackageBooking.sum('paid_amount', { where }),
        this.models.PackageBooking.sum('remaining_amount', { where })
      ]);

      return res.json({
        success: true,
        data: {
          customer_id: customerRef,
          customer_ids: uniqueCustomerIds,
          user_id: targetUserId,
          total: result.count,
          page,
          limit,
          total_pages: Math.ceil(result.count / limit),
          totals: {
            package_total: Number(packageTotal || 0),
            paid_amount: Number(paidTotal || 0),
            remaining_amount: Number(remainingTotal || 0)
          },
          rows: result.rows.map(row => this.serializeCustomerBooking(row))
        }
      });
    } catch (error) {
      console.error('Customer package bookings list error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async listCustomizablePackageBookings(req, res) {
    try {
      if (!this.models.PackageBooking || !this.models.Package) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
      const status = clean(req.query.status || req.query.payment_status);
      const bookingRef = clean(req.query.booking_id || req.query.booking_reference || req.query.reference);
      const customerRef = clean(req.query.customer_id || req.query.customerId || req.query.customer_email || req.query.email);
      const Op = this.models.PackageBooking.sequelize.Sequelize.Op;
      const Customer = this.models.Customer;
      const User = this.models.User;
      const where = {};

      if (status) where.payment_status = status;
      if (bookingRef) {
        where[isUuid(bookingRef) ? 'id' : 'booking_reference'] = bookingRef;
      }

      const identityConditions = [];
      if (customerRef) {
        if (customerRef.includes('@')) {
          identityConditions.push({ customer_email: customerRef.toLowerCase() });
        }
        if (isUuid(customerRef)) {
          identityConditions.push({ customer_id: customerRef });

          if (Customer) {
            const profiles = await Customer.findAll({ where: { user_id: customerRef }, attributes: ['id'] });
            const profileIds = profiles.map(profile => profile.id);
            if (profileIds.length) identityConditions.push({ customer_id: { [Op.in]: profileIds } });
          }
        }
      }

      if (identityConditions.length) where[Op.or] = identityConditions;

      const include = [
        {
          model: this.models.Package,
          as: 'package',
          required: true,
          where: { is_customizable: true },
          attributes: [
            'id', 'name', 'slug', 'price', 'discount_percentage', 'tax_type', 'tax_percent',
            'duration_days', 'description', 'main_image', 'main_image_alt', 'is_customizable', 'status'
          ]
        },
        Customer ? {
          model: Customer,
          as: 'customer',
          required: false,
          attributes: ['id', 'user_id', 'phone'],
          include: User ? [{ model: User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'phone_number'] }] : []
        } : null
      ].filter(Boolean);

      const result = await this.models.PackageBooking.findAndCountAll({
        where,
        include,
        limit,
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']],
        distinct: true
      });

      return res.json({
        success: true,
        data: {
          total: result.count,
          page,
          limit,
          total_pages: Math.ceil(result.count / limit),
          rows: result.rows.map(row => this.serializeCustomerBooking(row))
        }
      });
    } catch (error) {
      console.error('Customizable package bookings list error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async payRemaining(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageBooking || !this.db) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const booking = await this.findBooking(req.params.booking_id || req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Package booking not found.' });
      }

      const allowed = await this.ensureBookingAccess(booking, req);
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'You are not allowed to update this booking.' });
      }

      if (booking.accounting_status !== 'recorded') {
        return res.status(400).json({ success: false, message: 'Original booking accounting is not recorded yet.' });
      }

      const payload = req.body || {};
      const currentRemaining = money(booking.remaining_amount);
      const amount = money(payload.amount !== undefined ? payload.amount : (payload.payable_now !== undefined ? payload.payable_now : currentRemaining));
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Remaining payment amount must be greater than zero.' });
      }
      if (amount - currentRemaining > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Payment amount cannot be greater than remaining amount of ${currentRemaining}.`,
          data: {
            requested_amount: amount,
            current_remaining_amount: currentRemaining
          }
        });
      }

      const paymentReference = clean(payload.razorpay_payment_id || payload.payment_id || payload.transaction_id || payload.reference);
      const raw = booking.raw_payload || {};
      const remainingPayments = Array.isArray(raw.remaining_payments) ? raw.remaining_payments : [];
      if (paymentReference && remainingPayments.some(item => clean(item.reference) === paymentReference || clean(item.razorpay_payment_id) === paymentReference)) {
        return res.json({
          success: true,
          message: 'Remaining payment already recorded.',
          data: this.serializeBooking(booking)
        });
      }

      transaction = await this.db.transaction();

      const accountingEntry = this.accountingService && typeof this.accountingService.recordPackageRemainingPayment === 'function'
        ? await this.accountingService.recordPackageRemainingPayment({
          bookingId: booking.id,
          bookingRef: booking.booking_reference,
          amount,
          paymentReference
        }, req.user ? req.user.id : null, transaction)
        : null;

      const newPaidAmount = money(money(booking.paid_amount) + amount);
      const newRemainingAmount = money(Math.max(currentRemaining - amount, 0));
      const paidAt = payload.payment_verified_at ? new Date(payload.payment_verified_at) : new Date();
      const updatedRaw = {
        ...raw,
        remaining_payments: [
          ...remainingPayments,
          {
            amount,
            reference: paymentReference || null,
            razorpay_order_id: clean(payload.razorpay_order_id) || null,
            razorpay_payment_id: clean(payload.razorpay_payment_id) || null,
            journal_entry_id: accountingEntry ? accountingEntry.id : null,
            paid_at: Number.isNaN(paidAt.getTime()) ? new Date().toISOString() : paidAt.toISOString()
          }
        ]
      };

      await booking.update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        payment_status: newRemainingAmount <= 0 ? 'paid' : 'partial_paid',
        payment_verified_at: booking.payment_verified_at || (Number.isNaN(paidAt.getTime()) ? new Date() : paidAt),
        accounting_status: accountingEntry ? 'recorded' : booking.accounting_status,
        raw_payload: updatedRaw
      }, { transaction });

      await transaction.commit();
      transaction = null;

      const freshBooking = await this.models.PackageBooking.findByPk(booking.id);
      return res.json({
        success: true,
        message: newRemainingAmount <= 0 ? 'Remaining amount paid and receivable settled.' : 'Partial remaining payment recorded.',
        data: {
          booking: this.serializeBooking(freshBooking || booking),
          payment: {
            amount,
            remaining_amount: newRemainingAmount,
            journal_entry_id: accountingEntry ? accountingEntry.id : null
          }
        }
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Package remaining payment error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async refundBooking(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageBooking || !this.db) {
        return res.status(500).json({ success: false, message: 'Package booking is not configured.' });
      }

      const booking = await this.findBooking(req.params.booking_id || req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Package booking not found.' });
      }

      const allowed = await this.ensureBookingAccess(booking, req, { adminOnly: true });
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Only admin or manager can process package refunds.' });
      }

      transaction = await this.db.transaction();
      const result = await this.settlePackageReturn(booking, req.body || {}, req.user ? req.user.id : null, transaction);
      await transaction.commit();
      transaction = null;

      return res.json({
        success: true,
        message: result.message,
        data: {
          booking: this.serializeBooking(result.booking),
          refund: result.refund
        }
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Package refund error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  getReturnRequestInclude() {
    return [
      this.models.PackageBooking ? { model: this.models.PackageBooking, as: 'booking', required: false } : null,
      this.models.Customer ? { model: this.models.Customer, as: 'customer', required: false } : null,
      this.models.User ? { model: this.models.User, as: 'requestedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null,
      this.models.User ? { model: this.models.User, as: 'approvedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null,
      this.models.User ? { model: this.models.User, as: 'rejectedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null
    ].filter(Boolean);
  }

  serializeReturnRequest(row) {
    const request = row && row.get ? row.get({ plain: true }) : row;
    if (!request) return null;

    return {
      id: request.id,
      booking_id: request.booking_id,
      booking_reference: request.booking_reference,
      status: request.status,
      departure_date: request.departure_date || null,
      customer: {
        id: request.customer_id,
        name: request.customer_name,
        email: request.customer_email,
        phone: request.customer_phone
      },
      requested: {
        refund_amount: Number(request.requested_refund_amount || 0),
        cancel_remaining_amount: Number(request.requested_cancel_remaining_amount || 0)
      },
      reason: request.reason || null,
      admin_notes: request.admin_notes || null,
      cancellation_rule: request.cancellation_rule_snapshot || {},
      settlement: request.settlement_snapshot || {},
      accounting_entry_id: request.accounting_entry_id || null,
      requested_by: request.requestedBy ? {
        id: request.requestedBy.id,
        name: request.requestedBy.name,
        email: request.requestedBy.email,
        type: request.requestedBy.type
      } : { id: request.requested_by_user_id || null },
      approved_by: request.approvedBy ? {
        id: request.approvedBy.id,
        name: request.approvedBy.name,
        email: request.approvedBy.email,
        type: request.approvedBy.type
      } : (request.approved_by ? { id: request.approved_by } : null),
      rejected_by: request.rejectedBy ? {
        id: request.rejectedBy.id,
        name: request.rejectedBy.name,
        email: request.rejectedBy.email,
        type: request.rejectedBy.type
      } : (request.rejected_by ? { id: request.rejected_by } : null),
      approved_at: request.approved_at || null,
      rejected_at: request.rejected_at || null,
      created_at: request.created_at,
      updated_at: request.updated_at,
      booking: request.booking ? this.serializeBooking(request.booking) : null
    };
  }

  async createReturnRequest(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageBooking || !this.models.PackageReturnRequest || !this.db) {
        return res.status(500).json({ success: false, message: 'Package return requests are not configured.' });
      }

      const booking = await this.findBooking(req.params.booking_id || req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Package booking not found.' });
      }

      const allowed = await this.ensureCustomerReturnRequestAccess(booking, req);
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'You can request return only for your own booking.' });
      }

      const payload = req.body || {};
      const preview = await this.buildReturnRequestPreview(booking, payload);
      const existingPending = await this.models.PackageReturnRequest.findOne({
        where: { booking_id: booking.id, status: 'pending' }
      });
      if (existingPending) {
        return res.status(409).json({
          success: false,
          message: 'A pending return request already exists for this booking.',
          data: this.serializeReturnRequest(existingPending)
        });
      }

      transaction = await this.db.transaction();
      const requestRow = await this.models.PackageReturnRequest.create({
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        customer_id: booking.customer_id || null,
        requested_by_user_id: req.user ? req.user.id : null,
        customer_name: booking.customer_name || null,
        customer_email: booking.customer_email || null,
        customer_phone: booking.customer_phone || null,
        status: 'pending',
        departure_date: preview.departure_date,
        requested_refund_amount: preview.refund_amount,
        requested_cancel_remaining_amount: preview.cancel_remaining_amount,
        reason: clean(payload.reason || payload.return_reason || payload.notes) || null,
        cancellation_rule_snapshot: preview.cancellation_rule,
        settlement_snapshot: {}
      }, { transaction });

      await transaction.commit();
      transaction = null;

      const freshRequest = await this.models.PackageReturnRequest.findByPk(requestRow.id, {
        include: this.getReturnRequestInclude()
      });

      return res.status(201).json({
        success: true,
        message: 'Return request submitted for admin approval.',
        data: this.serializeReturnRequest(freshRequest || requestRow)
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Package return request error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async listMyReturnRequests(req, res) {
    try {
      if (!this.models.PackageReturnRequest) {
        return res.status(500).json({ success: false, message: 'Package return requests are not configured.' });
      }

      const user = req.user || {};
      const Op = this.models.PackageReturnRequest.sequelize.Sequelize.Op;
      const identityConditions = [];
      if (user.id) identityConditions.push({ requested_by_user_id: user.id });
      if (user.email) identityConditions.push({ customer_email: clean(user.email).toLowerCase() });

      if (this.models.Customer && user.id) {
        const customers = await this.models.Customer.findAll({ where: { user_id: user.id }, attributes: ['id'] });
        const customerIds = customers.map(customer => customer.id);
        if (customerIds.length) identityConditions.push({ customer_id: { [Op.in]: customerIds } });
      }

      if (!identityConditions.length) {
        return res.json({ success: true, data: { total: 0, rows: [] } });
      }

      const where = { [Op.or]: identityConditions };
      const status = clean(req.query.status);
      if (status) where.status = status;

      const rows = await this.models.PackageReturnRequest.findAll({
        where,
        include: this.getReturnRequestInclude(),
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          total: rows.length,
          rows: rows.map(row => this.serializeReturnRequest(row))
        }
      });
    } catch (error) {
      console.error('My package return requests error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async listReturnRequests(req, res) {
    try {
      if (!this.models.PackageReturnRequest) {
        return res.status(500).json({ success: false, message: 'Package return requests are not configured.' });
      }

      const allowed = await this.canProcessPackageRefund(req.user || {});
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Only admin or manager can view package return requests.' });
      }

      const where = {};
      const status = clean(req.query.status);
      if (status) where.status = status;
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

      const result = await this.models.PackageReturnRequest.findAndCountAll({
        where,
        include: this.getReturnRequestInclude(),
        limit,
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          total: result.count,
          page,
          limit,
          total_pages: Math.ceil(result.count / limit),
          rows: result.rows.map(row => this.serializeReturnRequest(row))
        }
      });
    } catch (error) {
      console.error('Package return requests list error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveReturnRequest(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageReturnRequest || !this.models.PackageBooking || !this.db) {
        return res.status(500).json({ success: false, message: 'Package return requests are not configured.' });
      }

      const allowed = await this.canProcessPackageRefund(req.user || {});
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Only admin or manager can approve package return requests.' });
      }

      transaction = await this.db.transaction();
      const requestRow = await this.models.PackageReturnRequest.findByPk(req.params.request_id || req.params.requestId, { transaction });
      if (!requestRow) {
        await transaction.rollback();
        transaction = null;
        return res.status(404).json({ success: false, message: 'Return request not found.' });
      }
      if (requestRow.status !== 'pending') {
        await transaction.rollback();
        transaction = null;
        return res.status(400).json({ success: false, message: `Return request is already ${requestRow.status}.` });
      }

      const booking = await this.models.PackageBooking.findByPk(requestRow.booking_id, { transaction });
      if (!booking) {
        throw httpError('Package booking not found.', 404);
      }

      const payload = req.body || {};
      const settlementPayload = {
        ...payload,
        apply_cancellation_rule: payload.apply_cancellation_rule === undefined ? true : payload.apply_cancellation_rule,
        departure_date: payload.departure_date || requestRow.departure_date,
        cancellation_rule_snapshot: requestRow.cancellation_rule_snapshot || {},
        cancel_remaining_amount: payload.cancel_remaining_amount !== undefined
          ? payload.cancel_remaining_amount
          : requestRow.requested_cancel_remaining_amount,
        refund_reference: clean(payload.refund_reference) || `return_request_${requestRow.id}`,
        reason: clean(payload.reason || payload.admin_notes) || requestRow.reason || 'Customer return request approved'
      };
      const settlement = await this.settlePackageReturn(booking, settlementPayload, req.user ? req.user.id : null, transaction);
      const refund = settlement.refund || {};

      await requestRow.update({
        status: 'approved',
        approved_by: req.user ? req.user.id : null,
        approved_at: new Date(),
        admin_notes: clean(payload.admin_notes || payload.notes) || null,
        accounting_entry_id: refund.journal_entry_id || null,
        requested_refund_amount: refund.refund_amount !== undefined ? refund.refund_amount : requestRow.requested_refund_amount,
        requested_cancel_remaining_amount: refund.cancel_remaining_amount !== undefined ? refund.cancel_remaining_amount : requestRow.requested_cancel_remaining_amount,
        settlement_snapshot: refund,
        cancellation_rule_snapshot: refund.cancellation_rule || requestRow.cancellation_rule_snapshot || {}
      }, { transaction });

      await transaction.commit();
      transaction = null;

      const freshRequest = await this.models.PackageReturnRequest.findByPk(requestRow.id, {
        include: this.getReturnRequestInclude()
      });

      return res.json({
        success: true,
        message: 'Return request approved and settled in accounting.',
        data: {
          request: this.serializeReturnRequest(freshRequest || requestRow),
          booking: this.serializeBooking(settlement.booking),
          refund
        }
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Package return request approval error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async rejectReturnRequest(req, res) {
    let transaction = null;

    try {
      if (!this.models.PackageReturnRequest || !this.db) {
        return res.status(500).json({ success: false, message: 'Package return requests are not configured.' });
      }

      const allowed = await this.canProcessPackageRefund(req.user || {});
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Only admin or manager can reject package return requests.' });
      }

      transaction = await this.db.transaction();
      const requestRow = await this.models.PackageReturnRequest.findByPk(req.params.request_id || req.params.requestId, { transaction });
      if (!requestRow) {
        await transaction.rollback();
        transaction = null;
        return res.status(404).json({ success: false, message: 'Return request not found.' });
      }
      if (requestRow.status !== 'pending') {
        await transaction.rollback();
        transaction = null;
        return res.status(400).json({ success: false, message: `Return request is already ${requestRow.status}.` });
      }

      const payload = req.body || {};
      await requestRow.update({
        status: 'rejected',
        rejected_by: req.user ? req.user.id : null,
        rejected_at: new Date(),
        admin_notes: clean(payload.admin_notes || payload.reason || payload.notes) || null
      }, { transaction });

      await transaction.commit();
      transaction = null;

      const freshRequest = await this.models.PackageReturnRequest.findByPk(requestRow.id, {
        include: this.getReturnRequestInclude()
      });

      return res.json({
        success: true,
        message: 'Return request rejected.',
        data: this.serializeReturnRequest(freshRequest || requestRow)
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Package return request rejection error:', error);
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  serializeCustomerBooking(booking) {
    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    if (!row) return null;

    const raw = row.raw_payload || {};
    const hotels = Array.isArray(raw.hotels) ? raw.hotels : [];
    const route = Array.isArray(raw.route) ? raw.route : [];
    const bookingCoupon = this.serializeCouponForBooking(row);
    const originalPackageBaseAmount = bookingCoupon && bookingCoupon.booking_amount !== null
      ? bookingCoupon.booking_amount
      : money(Number(row.package_base_amount || 0) + Number(row.coupon_discount_amount || 0));

    return {
      type: 'package_booking',
      id: row.id,
      booking_reference: row.booking_reference,
      package_id: row.package_id,
      package_slug: row.package_slug,
      package_name: row.package_name,
      vendor_id: row.vendor_id,
      customer_id: row.customer_id,
      from_date: row.from_date,
      to_date: row.to_date,
      departure_date: row.departure_date,
      travel_dates: {
        from_date: row.from_date,
        to_date: row.to_date,
        departure_date: row.departure_date
      },
      package: row.package ? {
        id: row.package.id,
        name: row.package.name,
        slug: row.package.slug,
        price: Number(row.package.price || 0),
        discount_percentage: Number(row.package.discount_percentage || 0),
        tax_type: row.package.tax_type || null,
        tax_percent: Number(row.package.tax_percent || 0),
        duration_days: row.package.duration_days,
        description: row.package.description || null,
        main_image: row.package.main_image || null,
        main_image_alt: row.package.main_image_alt || null,
        is_customizable: Boolean(row.package.is_customizable),
        status: row.package.status
      } : null,
      duration: raw.duration || null,
      route,
      hotels,
      hotel_count: raw.hotel_count || hotels.length,
      hotel_estimated_amount: Number(raw.hotel_estimated_amount || 0),
      customize: {
        is_customized: Boolean(raw.is_customized),
        message: raw.custom_message || raw.message || null
      },
      customer: {
        id: row.customer_id,
        profile_id: row.customer && row.customer.id ? row.customer.id : row.customer_id,
        user_id: row.customer && row.customer.user_id ? row.customer.user_id : null,
        name: row.customer_name || (row.customer && row.customer.user ? row.customer.user.name : null),
        email: row.customer_email || (row.customer && row.customer.user ? row.customer.user.email : null),
        phone: row.customer_phone || (row.customer && (row.customer.phone || (row.customer.user && row.customer.user.phone_number))) || null
      },
      vendor: row.vendor ? {
        id: row.vendor.id,
        name: row.vendor.name,
        email: row.vendor.email,
        phone: row.vendor.phone_number,
        type: row.vendor.type,
        status: row.vendor.status
      } : null,
      passengers: Array.isArray(row.passengers) ? row.passengers : [],
      amounts: {
        original_package_base_amount: originalPackageBaseAmount,
        package_base_amount: Number(row.package_base_amount || 0),
        coupon_discount_amount: Number(row.coupon_discount_amount || 0),
        tax_type: row.tax_type,
        tax_percent: Number(row.tax_percent || 0),
        tax_amount: Number(row.tax_amount || 0),
        package_total: Number(row.package_total || 0),
        paid_amount: Number(row.paid_amount || 0),
        payable_now: Number(row.paid_amount || 0),
        remaining_amount: Number(row.remaining_amount || 0),
        remaining_percentage: Number(raw.remaining_percentage || 0),
        partial_booking_enabled: Boolean(row.partial_booking_enabled),
        partial_booking_percentage: Number(row.partial_booking_percentage || 0)
      },
      coupon: bookingCoupon,
      payment: {
        status: row.payment_status,
        package_total: Number(row.package_total || 0),
        paid_amount: Number(row.paid_amount || 0),
        remaining_amount: Number(row.remaining_amount || 0),
        razorpay_order_id: row.razorpay_order_id,
        razorpay_payment_id: row.razorpay_payment_id,
        verified_at: row.payment_verified_at,
        remaining_payments: Array.isArray(raw.remaining_payments) ? raw.remaining_payments : []
      },
      accounting: {
        status: row.accounting_status,
        entry_id: row.accounting_entry_id
      },
      payment_status: row.payment_status,
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_id: row.razorpay_payment_id,
      payment_verified_at: row.payment_verified_at,
      page_url: row.page_url,
      raw_payload: raw,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  serializeBooking(booking) {
    const row = booking && booking.get ? booking.get({ plain: true }) : booking;
    if (!row) return null;
    const bookingCoupon = this.serializeCouponForBooking(row);
    const originalPackageBaseAmount = bookingCoupon && bookingCoupon.booking_amount !== null
      ? bookingCoupon.booking_amount
      : money(Number(row.package_base_amount || 0) + Number(row.coupon_discount_amount || 0));

    return {
      id: row.id,
      booking_reference: row.booking_reference,
      package_id: row.package_id,
      package_slug: row.package_slug,
      package_name: row.package_name,
      vendor_id: row.vendor_id,
      customer_id: row.customer_id,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone
      },
      amounts: {
        original_package_base_amount: originalPackageBaseAmount,
        package_base_amount: Number(row.package_base_amount || 0),
        coupon_discount_amount: Number(row.coupon_discount_amount || 0),
        tax_type: row.tax_type,
        tax_percent: Number(row.tax_percent || 0),
        tax_amount: Number(row.tax_amount || 0),
        package_total: Number(row.package_total || 0),
        paid_amount: Number(row.paid_amount || 0),
        remaining_amount: Number(row.remaining_amount || 0)
      },
      split: {
        vendor_amount: Number(row.vendor_amount || 0),
        platform_amount: Number(row.platform_amount || 0),
        basis: row.vendor_split_basis,
        applied: Boolean(row.vendor_id)
      },
      coupon: bookingCoupon,
      payment_status: row.payment_status,
      accounting_status: row.accounting_status,
      accounting_entry_id: row.accounting_entry_id,
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_id: row.razorpay_payment_id,
      created_at: row.created_at
    };
  }

  async editBooking(req, res) {
    try {
      const { PackageBooking } = this.models;
      const bookingId = req.params.booking_id;
      const booking = await PackageBooking.findByPk(bookingId);
      if (!booking) {
        return res.status(303).redirect(`/admin/bookings/package-bookings?error=${encodeURIComponent('Booking not found')}`);
      }

      const { payment_status, accounting_status, customer_name, customer_email, customer_phone } = req.body;

      const updates = {};
      if (payment_status !== undefined && payment_status !== '') updates.payment_status = payment_status.trim();
      if (accounting_status !== undefined && accounting_status !== '') updates.accounting_status = accounting_status.trim();
      if (customer_name !== undefined) updates.customer_name = customer_name.trim() || null;
      if (customer_email !== undefined) updates.customer_email = customer_email.trim() || null;
      if (customer_phone !== undefined) updates.customer_phone = customer_phone.trim() || null;

      if (Object.keys(updates).length > 0) {
        await booking.update(updates);
      }

      return res.status(303).redirect(`/admin/bookings/package-bookings?success=${encodeURIComponent('Booking updated successfully')}`);
    } catch (error) {
      console.error('Error editing package booking:', error);
      return res.status(303).redirect(`/admin/bookings/package-bookings?error=${encodeURIComponent(error.message || 'Failed to update booking')}`);
    }
  }
}

module.exports = ApiPackageBookingController;
