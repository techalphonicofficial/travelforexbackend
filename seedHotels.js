const { db, models } = require('./src/container');

const TARGET_COUNT = 1000;
const PROVIDER_NAME = 'Seed Hotels';

const brandWords = [
  'Grand', 'Royal', 'Palm', 'Vista', 'Heritage', 'Blue', 'Golden', 'Silver',
  'Urban', 'Lake', 'Hill', 'Garden', 'Coral', 'Pearl', 'Regal', 'Crown',
  'Sunrise', 'Moonlight', 'Emerald', 'Sapphire'
];

const propertyWords = [
  'Residency', 'Retreat', 'Suites', 'Inn', 'Resort', 'Palace', 'Stay',
  'Heights', 'Plaza', 'House', 'Lodge', 'Villa', 'Haven', 'Grand',
  'Court', 'Escape', 'Nest', 'Bay', 'Point', 'Club'
];

const baseAmenities = [
  'Restaurant',
  'Wi-Fi',
  'Smoke Detector',
  'Laundry Service',
  'Room Service',
  'Air Conditioning'
];

const extraAmenities = [
  'Parking',
  'Swimming Pool',
  'Fitness Center',
  'Airport Transfer',
  'Breakfast',
  'Spa'
];

function seededNumber(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function priceForRating(rating, index) {
  const baseByRating = {
    1: 900,
    2: 1500,
    3: 2500,
    4: 4500,
    5: 7500
  };
  const spreadByRating = {
    1: 700,
    2: 1200,
    3: 2200,
    4: 3500,
    5: 6500
  };

  const base = baseByRating[rating];
  const spread = spreadByRating[rating];
  const value = base + Math.round(seededNumber(index + rating * 13) * spread);
  return Number((Math.ceil(value / 50) * 50).toFixed(2));
}

function detailsForHotel(rating, index) {
  const selectedExtras = extraAmenities
    .filter((_, amenityIndex) => ((index + amenityIndex) % 2 === 0))
    .slice(0, 2 + (index % 3));

  return {
    total_rooms: 25 + Math.floor(seededNumber(index * 17) * 220),
    guest_rating: Number(Math.min(5, 3.1 + rating * 0.28 + seededNumber(index + 31) * 0.8).toFixed(1)),
    amenities: [...new Set([...baseAmenities, ...selectedExtras])],
    discount_percent: Number(([0, 5, 8, 10, 12, 15, 20][index % 7]).toFixed(2))
  };
}

async function updateExistingSeedHotels() {
  const existingHotels = await models.Hotel.findAll({
    where: { provider_name: PROVIDER_NAME },
    order: [['id', 'ASC']]
  });

  for (let index = 0; index < existingHotels.length; index++) {
    const hotel = existingHotels[index];
    const rating = hotel.star_rating || ((index + 1) % 5) + 1;
    await hotel.update(detailsForHotel(rating, index + 1));
  }

  if (existingHotels.length) {
    console.log(`Updated details for ${existingHotels.length} existing seed hotels.`);
  }
}

async function seedHotels() {
  await db.authenticate();

  const destinations = await models.Destination.findAll({
    attributes: ['id', 'name'],
    order: [['id', 'ASC']]
  });

  if (!destinations.length) {
    console.log('No destinations found. Add destinations before seeding hotels.');
    return;
  }

  const existingSeedCount = await models.Hotel.count({
    where: { provider_name: PROVIDER_NAME }
  });

  const remaining = TARGET_COUNT - existingSeedCount;
  if (remaining <= 0) {
    await updateExistingSeedHotels();
    console.log(`${existingSeedCount} seed hotels already exist. Nothing to add.`);
    return;
  }

  const hotels = [];
  for (let offset = 0; offset < remaining; offset++) {
    const index = existingSeedCount + offset + 1;
    const destination = destinations[(index - 1) % destinations.length];
    const rating = (index % 5) + 1;
    const brand = brandWords[index % brandWords.length];
    const property = propertyWords[(index * 7) % propertyWords.length];
    const cityName = String(destination.name || 'Destination').replace(/[^a-z0-9 ]/gi, '').trim() || 'Destination';

    hotels.push({
      name: `${brand} ${cityName} ${property} ${index}`,
      destination_id: destination.id,
      star_rating: rating,
      price_per_night: priceForRating(rating, index),
      ...detailsForHotel(rating, index),
      description: `${rating}-star seeded hotel in ${cityName} with nightly pricing for testing hotel search and booking flows.`,
      image_url: null,
      source_type: 'manual',
      provider_name: PROVIDER_NAME
    });
  }

  const chunkSize = 100;
  for (let i = 0; i < hotels.length; i += chunkSize) {
    await models.Hotel.bulkCreate(hotels.slice(i, i + chunkSize));
  }

  await updateExistingSeedHotels();
  console.log(`Created ${hotels.length} hotels. Total seed hotels: ${TARGET_COUNT}.`);
}

seedHotels()
  .catch(error => {
    console.error('Failed to seed hotels:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
