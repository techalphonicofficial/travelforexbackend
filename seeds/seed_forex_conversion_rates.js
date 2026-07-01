require('dotenv').config();

const https = require('https');
const sequelize = require('../src/database');
const { Country: CSCountry } = require('country-state-city');
const {
  models: { Country, ForexConversionRate }
} = require('../src/container');

const BASE_CODE = 'INR';
const RATE_API_URL = process.env.FOREX_RATE_API_URL || `https://open.er-api.com/v6/latest/${BASE_CODE}`;

// Special or legacy currency codes that may not be present in public rate APIs.
// Values are INR per 1 unit of the listed code and are only used if the API
// does not return that code.
const MANUAL_INR_RATES = {
  AAD: 83.500000, // Antarctica placeholder code in country-state-city.
  CUC: 83.500000, // Cuban convertible peso, retired but still present in some datasets.
  FOK: 12.100000,
  GGP: 106.000000,
  IMP: 106.000000,
  JEP: 106.000000,
  KID: 55.200000,
  KPW: 0.093000,
  SLE: 1.920000,
  SSP: 0.091000,
  STN: 3.730000,
  TVD: 55.200000,
  VES: 0.860000,
  XDR: 112.000000
};

const COUNTRY_CURRENCY_OVERRIDES = {
  mauritania: ['MRU'],
  'new zealandhhh': ['NZD'],
  'north korea': ['KPW'],
  'sao tome and principe': ['STN'],
  venezuela: ['VES']
};

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function currencyCandidates(value) {
  return String(value || '')
    .split(/[,/| ]+/)
    .map(code => code.trim().toUpperCase())
    .filter(Boolean);
}

function fetchJson(url) {
  if (typeof fetch === 'function') {
    return fetch(url).then(async response => {
      if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
      return response.json();
    });
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`HTTP ${response.statusCode} from ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

async function loadInrRates() {
  const data = await fetchJson(RATE_API_URL);
  if (!data || data.result !== 'success' || !data.rates) {
    throw new Error('Exchange rate API did not return a successful rates payload');
  }

  if (String(data.base_code || '').toUpperCase() !== BASE_CODE) {
    throw new Error(`Expected API base_code ${BASE_CODE}, got ${data.base_code || 'unknown'}`);
  }

  return {
    rates: data.rates,
    updatedAt: data.time_last_update_utc || new Date().toISOString()
  };
}

function rateInInr(code, apiRates) {
  if (code === BASE_CODE) return 1;

  const unitsPerInr = Number(apiRates[code]);
  if (Number.isFinite(unitsPerInr) && unitsPerInr > 0) {
    return 1 / unitsPerInr;
  }

  const manualRate = Number(MANUAL_INR_RATES[code]);
  if (Number.isFinite(manualRate) && manualRate > 0) {
    return manualRate;
  }

  return null;
}

function buildCountryCurrencyLookup() {
  const lookup = new Map();

  for (const country of CSCountry.getAllCountries()) {
    lookup.set(normalizeName(country.name), currencyCandidates(country.currency));
  }

  return lookup;
}

async function seedForexConversionRates() {
  let transaction;

  try {
    await sequelize.authenticate();

    const { rates, updatedAt } = await loadInrRates();
    const countryCurrencyLookup = buildCountryCurrencyLookup();
    const countries = await Country.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    transaction = await sequelize.transaction();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const skippedRows = [];

    for (const country of countries) {
      const countryName = country.name;
      const normalizedCountryName = normalizeName(countryName);
      const candidates = COUNTRY_CURRENCY_OVERRIDES[normalizedCountryName] || countryCurrencyLookup.get(normalizedCountryName) || [];
      const selected = candidates
        .map(code => ({ code, rate: rateInInr(code, rates) }))
        .find(item => item.rate !== null);

      if (!selected) {
        skipped += 1;
        skippedRows.push(`${countryName}${candidates.length ? ` (${candidates.join(', ')})` : ''}`);
        continue;
      }

      const usedManualRate = !rates[selected.code] && MANUAL_INR_RATES[selected.code];
      const notes = usedManualRate
        ? `Seeded INR reference rate using manual fallback for ${selected.code}`
        : `Seeded INR reference rate from ExchangeRate-API (${updatedAt})`;

      const payload = {
        country_id: country.id,
        code: selected.code,
        base_code: BASE_CODE,
        conversion_rate: selected.rate.toFixed(6),
        is_active: true,
        notes: notes.slice(0, 255)
      };

      const [record, wasCreated] = await ForexConversionRate.findOrCreate({
        where: {
          country_id: country.id,
          code: selected.code,
          base_code: BASE_CODE
        },
        defaults: payload,
        transaction
      });

      if (wasCreated) {
        created += 1;
      } else {
        await record.update(payload, { transaction });
        updated += 1;
      }
    }

    await transaction.commit();

    console.log('Forex conversion rates seeded.');
    console.log(`Countries checked: ${countries.length}`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    if (skippedRows.length) {
      console.log(`Skipped countries: ${skippedRows.join('; ')}`);
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Forex conversion rates seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedForexConversionRates();
