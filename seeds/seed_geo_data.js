require('dotenv').config();

const sequelize = require('../src/database');
const { Country: CSCountry, City: CSCity } = require('country-state-city');
const {
  Continent,
  Country,
  City,
  Destination,
  DestinationMapping
} = require('../src/container').models;

const CONTINENTS = [
  { name: 'Africa', latitude: 1.6508, longitude: 17.6791 },
  { name: 'Antarctica', latitude: -82.8628, longitude: 135.0000 },
  { name: 'Asia', latitude: 34.0479, longitude: 100.6197 },
  { name: 'Europe', latitude: 54.5260, longitude: 15.2551 },
  { name: 'North America', latitude: 54.5260, longitude: -105.2551 },
  { name: 'Oceania', latitude: -22.7359, longitude: 140.0188 },
  { name: 'South America', latitude: -8.7832, longitude: -55.4915 }
];

const SOUTH_AMERICA = new Set(['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY', 'PE', 'PY', 'SR', 'UY', 'VE']);
const DESTINATION_FALLBACK = {
  goa: { city: 'goa velha', country: 'india' },
  bangkok: { city: 'bangkok', country: 'thailand' },
  dubai: { city: 'dubai', country: 'united arab emirates' },
  paris: { city: 'paris', country: 'france' },
  switzerland: { city: 'interlaken', country: 'switzerland' },
  bali: { city: 'denpasar', country: 'indonesia' },
  maldives: { city: 'male', country: 'maldives' },
  thailand: { city: 'bangkok', country: 'thailand' },
  france: { city: 'paris', country: 'france' },
  'united arab emirates': { city: 'dubai', country: 'united arab emirates' },
  uae: { city: 'dubai', country: 'united arab emirates' }
};

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function continentForCountry(country) {
  const zones = (country.timezones || []).map(tz => tz.zoneName || '');
  const zonePrefixes = zones.map(zone => zone.split('/')[0]);
  const lat = toNumber(country.latitude);

  if (zonePrefixes.includes('Antarctica')) return 'Antarctica';
  if (zonePrefixes.includes('Africa')) return 'Africa';
  if (zonePrefixes.includes('Europe')) return 'Europe';
  if (zonePrefixes.includes('Asia')) return 'Asia';
  if (zonePrefixes.includes('Australia') || zonePrefixes.includes('Pacific')) return 'Oceania';
  if (SOUTH_AMERICA.has(country.isoCode)) return 'South America';
  if (zonePrefixes.includes('America')) return lat !== null && lat < 8 ? 'South America' : 'North America';
  if (zonePrefixes.includes('Atlantic')) return lat !== null && lat < 0 ? 'South America' : 'Europe';
  if (zonePrefixes.includes('Indian')) return lat !== null && lat < -10 ? 'Oceania' : 'Africa';

  return 'Asia';
}

async function bulkCreateInChunks(model, rows, chunkSize = 5000) {
  let created = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await model.bulkCreate(chunk, { validate: false });
    created += chunk.length;
    console.log(`   ${model.tableName}: ${created}/${rows.length}`);
  }
}

async function remapExistingDestinations(cityLookup, cityCountryLookup) {
  const destinations = await Destination.findAll();
  const rows = [];

  for (const destination of destinations) {
    const destinationKey = destination.name.toLowerCase();
    const fallback = DESTINATION_FALLBACK[destinationKey];
    const city = fallback
      ? cityCountryLookup.get(`${fallback.city}|${fallback.country}`)
      : cityLookup.get(destinationKey);
    if (!city) continue;

    rows.push({
      destination_id: destination.id,
      city_id: city.id
    });
  }

  if (!rows.length) return 0;

  await DestinationMapping.bulkCreate(rows, { ignoreDuplicates: true });
  return rows.length;
}

async function seedGeoData() {
  console.log('Starting geo seed...');

  await sequelize.query('TRUNCATE TABLE destination_mappings, cities, countries, continents RESTART IDENTITY CASCADE');

  const continents = await Continent.bulkCreate(CONTINENTS, { returning: true });
  const continentByName = new Map(continents.map(continent => [continent.name, continent]));
  console.log(`Seeded continents: ${continents.length}`);

  const sourceCountries = CSCountry.getAllCountries();
  const countryRows = sourceCountries.map(country => ({
    name: country.name,
    continent_id: continentByName.get(continentForCountry(country)).id,
    latitude: toNumber(country.latitude),
    longitude: toNumber(country.longitude)
  }));

  const countries = await Country.bulkCreate(countryRows, { returning: true, validate: false });
  const countryByCode = new Map();
  sourceCountries.forEach((country, index) => {
    countryByCode.set(country.isoCode, countries[index]);
  });
  console.log(`Seeded countries: ${countries.length}`);

  const sourceCities = CSCity.getAllCities();
  const cityRows = sourceCities
    .map(city => {
      const country = countryByCode.get(city.countryCode);
      if (!country) return null;

      return {
        name: city.name,
        country_id: country.id,
        latitude: toNumber(city.latitude),
        longitude: toNumber(city.longitude)
      };
    })
    .filter(Boolean);

  await bulkCreateInChunks(City, cityRows, 5000);

  const seededCities = await City.findAll({
    include: [{ model: Country, as: 'country', attributes: ['id', 'name', 'continent_id'] }]
  });
  const cityLookup = new Map();
  const cityCountryLookup = new Map();
  for (const city of seededCities) {
    const key = city.name.toLowerCase();
    if (!cityLookup.has(key)) cityLookup.set(key, city);
    if (city.country) cityCountryLookup.set(`${key}|${city.country.name.toLowerCase()}`, city);
  }

  const remapped = await remapExistingDestinations(cityLookup, cityCountryLookup);

  console.log('Geo seed completed.');
  console.log(`Continents: ${continents.length}`);
  console.log(`Countries: ${countries.length}`);
  console.log(`Cities: ${cityRows.length}`);
  console.log(`Destination mappings restored by city name: ${remapped}`);
}

seedGeoData()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Geo seed failed:', err);
    process.exit(1);
  });
