const express = require('express');
const router = express.Router();
const {
  repositories: { forexConversionRateRepo, appSettingRepo },
  models: { Customer, ForexConversionRequest }
} = require('../container');

const normalizeCurrency = (value) => String(value || '').trim().toUpperCase();
const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
const roundRate = (value) => Number(Number(value || 0).toFixed(6));
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getInrRate = async (code) => {
  const currency = normalizeCurrency(code);
  if (currency === 'INR') return 1;

  const rows = await forexConversionRateRepo.findPublic({ code: currency, base_code: 'INR' });
  const row = rows.find(item => Number(item.conversion_rate || 0) > 0);
  return row ? Number(row.conversion_rate || 0) : 0;
};

const resolveCustomer = async (id) => {
  let customer = await Customer.findByPk(id);
  if (!customer) {
    customer = await Customer.findOne({ where: { user_id: id } });
  }
  return customer;
};

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const submitForexRequest = async (input = {}) => {
  const customerId = String(input.customer_id || '').trim();
  const fromCurrency = normalizeCurrency(input.from_currency || input.from || input.currency_from);
  const toCurrency = normalizeCurrency(input.to_currency || input.to || input.currency_to);
  const amount = Number(input.amount || 0);

  if (!customerId) throw httpError(400, 'customer_id is required');
  if (!isUuid(customerId)) throw httpError(400, 'customer_id must be a valid UUID');
  if (!fromCurrency || !toCurrency) throw httpError(400, 'from_currency and to_currency are required');
  if (!Number.isFinite(amount) || amount <= 0) throw httpError(400, 'amount must be greater than zero');

  const customer = await resolveCustomer(customerId);
  if (!customer) throw httpError(404, 'Customer not found for customer_id or user_id');
  const customerProfileId = customer.id;

  const [fromInrRate, toInrRate, rawChargeType, rawChargeValue] = await Promise.all([
    getInrRate(fromCurrency),
    getInrRate(toCurrency),
    appSettingRepo.get('forex_service_charge_type'),
    appSettingRepo.get('forex_service_charge_value')
  ]);

  if (!fromInrRate) throw httpError(404, `No active INR forex rate found for ${fromCurrency}`);
  if (!toInrRate) throw httpError(404, `No active INR forex rate found for ${toCurrency}`);

  const conversionRate = fromInrRate / toInrRate;
  const convertedAmount = amount * conversionRate;
  const serviceChargeType = rawChargeType === 'fixed' ? 'fixed' : 'percent';
  const serviceChargeValue = Math.max(Number(rawChargeValue || 0), 0);
  const serviceChargeAmount = serviceChargeType === 'fixed'
    ? serviceChargeValue / toInrRate
    : convertedAmount * (serviceChargeValue / 100);
  const totalAmount = Math.max(convertedAmount - serviceChargeAmount, 0);

  const request = await ForexConversionRequest.create({
    customer_id: customerProfileId,
    from_currency: fromCurrency,
    to_currency: toCurrency,
    amount: roundMoney(amount),
    conversion_rate: roundRate(conversionRate),
    converted_amount: roundMoney(convertedAmount),
    service_charge_type: serviceChargeType,
    service_charge_value: roundMoney(serviceChargeValue),
    service_charge_amount: roundMoney(serviceChargeAmount),
    total_amount: roundMoney(totalAmount),
    status: 'new'
  });

  return {
    request,
    data: {
      id: request.id,
      customer_id: customerProfileId,
      requested_customer_id: customerId,
      user_id: customer.user_id,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      currency_pair: `${fromCurrency}_${toCurrency}`,
      currency_pair_label: `${fromCurrency} → ${toCurrency}`,
      amount: roundMoney(amount),
      conversion_rate: roundRate(conversionRate),
      converted_amount: roundMoney(convertedAmount),
      service_charge_type: serviceChargeType,
      service_charge_value: roundMoney(serviceChargeValue),
      service_charge_amount: roundMoney(serviceChargeAmount),
      service_charge: roundMoney(serviceChargeAmount),
      total_amount: roundMoney(totalAmount),
      total_payable: roundMoney(totalAmount),
      status: request.status || 'new',
      currency: toCurrency,
      crm_status: 'pending',
      accounting_status: 'pending'
    }
  };
};

/**
 * @swagger
 * /api/v1/forex-rates:
 *   get:
 *     summary: Get forex conversion rates
 *     description: Returns active country-wise forex conversion rates. Filter by country_id, country, code/currency_code, or base_code.
 *     tags: [Forex Rates]
 *     parameters:
 *       - in: query
 *         name: country_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         example: United States
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         example: USD
 *       - in: query
 *         name: base_code
 *         schema:
 *           type: string
 *         example: INR
 *     responses:
 *       200:
 *         description: Active forex conversion rates
 */
router.get('/', async (req, res) => {
  try {
    const rows = await forexConversionRateRepo.findPublic(req.query || {});
    res.json({
      success: true,
      data: rows.map(row => forexConversionRateRepo.serializePublic(row))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/forex-rates/public-board:
 *   get:
 *     summary: Get public forex board rates
 *     description: Returns active forex rates with calculated buy and sell rates based on interbank standard spread.
 *     tags: [Forex Rates]
 *     responses:
 *       200:
 *         description: Public forex board rates
 */
router.get('/public-board', async (req, res) => {
  try {
    const [rows, rawSpread] = await Promise.all([
      forexConversionRateRepo.findPublic({ base_code: 'INR' }),
      appSettingRepo.get('public_forex_spread_percentage')
    ]);
    
    // Fallback to 1% spread if not configured in settings
    const spreadPercentage = Number(rawSpread) > 0 ? Number(rawSpread) : 1; 
    const halfSpreadMultiplier = (spreadPercentage / 100) / 2;

    const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });
    
    // Deduplicate by code in case multiple countries use the same currency (like EUR)
    const uniqueCodes = new Set();
    const board = [];

    for (const row of rows) {
      if (uniqueCodes.has(row.code)) continue;
      uniqueCodes.add(row.code);

      const conversion_rate = Number(row.conversion_rate || 0);
      const spread = conversion_rate * halfSpreadMultiplier;

      
      let name = row.code;
      try { name = currencyNames.of(row.code); } catch(e) {}
      if (row.code === 'AED') name = 'UAE Dirham'; // Match UI exactly
      
      board.push({
        code: row.code,
        currency_name: name,
        buy_rate: roundMoney(conversion_rate - spread),
        sell_rate: roundMoney(conversion_rate + spread),
        updated_at: row.updated_at
      });
    }

    // Pagination logic
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedBoard = board.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBoard,
      meta: {
        current_page: page,
        per_page: limit,
        total_items: board.length,
        total_pages: Math.ceil(board.length / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/forex-rates/convert:
 *   get:
 *     summary: Create and calculate a forex conversion request
 *     description: Calculates amount from one currency to another, deducts configured service charge, stores the customer request, and returns converted, service charge, and total amount. customer_id can be customers.id or users.id.
 *     tags: [Forex Rates]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Accepts customers.id or users.id
 *       - in: query
 *         name: from_currency
 *         required: true
 *         schema:
 *           type: string
 *         example: USD
 *       - in: query
 *         name: to_currency
 *         required: true
 *         schema:
 *           type: string
 *         example: INR
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         example: 100
 *     responses:
 *       200:
 *         description: Forex conversion request created
 */
router.get('/convert', async (req, res) => {
  try {
    const result = await submitForexRequest(req.query || {});
    res.json({
      success: true,
      message: 'Forex conversion request created',
      data: result.data
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/forex-rates/submit-request:
 *   post:
 *     summary: Submit a forex service request
 *     description: Creates one forex service request with status "new" after calculating converted amount, service charge, and total payable. customer_id can be customers.id or users.id.
 *     tags: [Forex Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - from_currency
 *               - to_currency
 *               - amount
 *             properties:
 *               customer_id:
 *                 type: string
 *                 description: Accepts customers.id or users.id
 *               from_currency:
 *                 type: string
 *                 example: USD
 *               to_currency:
 *                 type: string
 *                 example: INR
 *               amount:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Forex service request submitted
 */
router.post('/submit-request', async (req, res) => {
  try {
    const result = await submitForexRequest(req.body || {});
    res.status(201).json({
      success: true,
      message: 'Forex service request submitted',
      data: result.data
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/forex-rates/{code}:
 *   get:
 *     summary: Get forex conversion rate by country or code
 *     description: Looks up active rates by currency code, base code, country id, or country name.
 *     tags: [Forex Rates]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: USD
 *     responses:
 *       200:
 *         description: Matching active rates
 *       404:
 *         description: No active rate found
 */
router.get('/:code', async (req, res) => {
  try {
    const rows = await forexConversionRateRepo.findByCountryOrCode(req.params.code);
    if (!rows.length) return res.status(404).json({ success: false, message: 'No active forex conversion rate found' });
    res.json({
      success: true,
      data: rows.map(row => forexConversionRateRepo.serializePublic(row))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
