const sequelize = require('../src/database');
const {
  models: { Country, ForexService }
} = require('../src/container');

const seedRows = [
  { country: 'India', code: 'INR', exchange_type: 'Buy & Sell' },
  { country: 'India', code: 'USD', exchange_type: 'Sell' },
  { country: 'United States', code: 'USD', exchange_type: 'Buy & Sell' },
  { country: 'United Arab Emirates', code: 'AED', exchange_type: 'Buy & Sell' },
  { country: 'Thailand', code: 'THB', exchange_type: 'Buy & Sell' },
  { country: 'France', code: 'EUR', exchange_type: 'Buy & Sell' },
  { country: 'Switzerland', code: 'CHF', exchange_type: 'Buy & Sell' },
  { country: 'United Kingdom', code: 'GBP', exchange_type: 'Buy & Sell' },
  { country: 'Singapore', code: 'SGD', exchange_type: 'Buy & Sell' },
  { country: 'Australia', code: 'AUD', exchange_type: 'Buy & Sell' },
  { country: 'Japan', code: 'JPY', exchange_type: 'Buy & Sell' },
  { country: 'Indonesia', code: 'IDR', exchange_type: 'Buy & Sell' }
];

async function seedForexServices() {
  try {
    await sequelize.authenticate();

    const countries = await Country.findAll({
      attributes: ['id', 'name']
    });
    const countryByName = new Map(countries.map(country => [country.name.toLowerCase(), country]));

    let created = 0;
    let existing = 0;
    let skipped = 0;

    for (const row of seedRows) {
      const country = countryByName.get(row.country.toLowerCase());
      if (!country) {
        skipped += 1;
        console.log(`Skipped ${row.code} (${row.country}) - country not found`);
        continue;
      }

      const [, wasCreated] = await ForexService.findOrCreate({
        where: {
          country_id: country.id,
          code: row.code,
          exchange_type: row.exchange_type
        },
        defaults: {
          country_id: country.id,
          code: row.code,
          exchange_type: row.exchange_type
        }
      });

      if (wasCreated) created += 1;
      else existing += 1;
    }

    console.log(`Forex services seeded. Created: ${created}, existing: ${existing}, skipped: ${skipped}`);
  } catch (error) {
    console.error('Forex services seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedForexServices();
