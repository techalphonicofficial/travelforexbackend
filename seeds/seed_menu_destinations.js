require('dotenv').config();

const sequelize = require('../src/database');
const {
  Continent,
  Country,
  City,
  Destination,
  DestinationMapping,
  Category,
  DestinationCategory,
  Package,
  PackageDestination
} = require('../src/container').models;

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const findOrCreateByName = async (model, name, defaults = {}, transaction) => {
  const [record] = await model.findOrCreate({
    where: { name },
    defaults: { name, ...defaults },
    transaction
  });

  const updates = {};
  Object.entries(defaults).forEach(([key, value]) => {
    if (record[key] === null || record[key] === undefined || record[key] === '') {
      updates[key] = value;
    }
  });

  if (Object.keys(updates).length) {
    await record.update(updates, { transaction });
  }

  return record;
};

const findOrCreateCategory = async (data, transaction) => {
  const [category] = await Category.findOrCreate({
    where: { name: data.name },
    defaults: {
      slug: slugify(data.name),
      description: data.description || null,
      tag_color: data.tag_color,
      show_in_menu: true,
      show_in_home: data.show_in_home || false,
      is_tour_type: data.is_tour_type || false,
      sort_order: data.sort_order || 0
    },
    transaction
  });

  await category.update({
    tag_color: data.tag_color,
    show_in_menu: true,
    show_in_home: data.show_in_home || false,
    is_tour_type: data.is_tour_type || false,
    sort_order: data.sort_order || 0
  }, { transaction });

  return category;
};

const upsertDestination = async (data, helpers, transaction) => {
  const continent = await findOrCreateByName(Continent, data.continent, {}, transaction);
  const country = await findOrCreateByName(Country, data.country, { continent_id: continent.id }, transaction);
  const city = await findOrCreateByName(City, data.city || data.name, { country_id: country.id }, transaction);
  const slug = data.slug || slugify(data.name);

  const [destination] = await Destination.findOrCreate({
    where: { slug },
    defaults: {
      name: data.name,
      title: data.title || `${data.name} Tour Packages`,
      type: data.type || 'international',
      slug,
      is_trending: !!data.is_trending,
      is_visa_free: !!data.is_visa_free,
      customize: !!data.is_customizable,
      is_customizable: !!data.is_customizable,
      feature_image: data.feature_image || null,
      feature_image_alt: data.feature_image_alt || `${data.name} packages`
    },
    transaction
  });

  await destination.update({
    name: data.name,
    title: data.title || destination.title || `${data.name} Tour Packages`,
    type: data.type || destination.type || 'international',
    is_trending: !!data.is_trending,
    is_visa_free: !!data.is_visa_free,
    customize: !!data.is_customizable,
    is_customizable: !!data.is_customizable,
    feature_image: data.feature_image || destination.feature_image,
    feature_image_alt: data.feature_image_alt || destination.feature_image_alt || `${data.name} packages`
  }, { transaction });

  await DestinationMapping.findOrCreate({
    where: { destination_id: destination.id, city_id: city.id },
    defaults: { destination_id: destination.id, city_id: city.id },
    transaction
  });

  if (data.badge && helpers.categories[data.badge]) {
    await DestinationCategory.findOrCreate({
      where: { destination_id: destination.id, category_id: helpers.categories[data.badge].id },
      defaults: { destination_id: destination.id, category_id: helpers.categories[data.badge].id },
      transaction
    });
  }

  return destination;
};

const upsertPackage = async (destination, index, transaction) => {
  const slug = `${destination.slug}-packages`;
  const [pkg] = await Package.findOrCreate({
    where: { slug },
    defaults: {
      name: `${destination.name} Packages`,
      slug,
      duration_days: 5 + (index % 4),
      price: 30000 + (index * 4500),
      status: true,
      show_in_home_page: index < 6,
      is_customizable: true,
      description: `Curated ${destination.name} holiday package with stays, sightseeing, and customizable itinerary options.`,
      main_image: destination.feature_image,
      main_image_alt: `${destination.name} holiday package`
    },
    transaction
  });

  await pkg.update({
    status: true,
    is_customizable: true,
    main_image: destination.feature_image || pkg.main_image,
    main_image_alt: `${destination.name} holiday package`
  }, { transaction });

  await PackageDestination.findOrCreate({
    where: { package_id: pkg.id, destination_id: destination.id },
    defaults: {
      package_id: pkg.id,
      destination_id: destination.id,
      nights: Math.max((pkg.duration_days || 5) - 1, 1),
      activities: {},
      order: 1
    },
    transaction
  });
};

const seed = async () => {
  const transaction = await sequelize.transaction();

  try {
    const categories = {};
    for (const category of [
      { name: 'Honeymoon', tag_color: 'pink', sort_order: 1, show_in_home: true, is_tour_type: true },
      { name: 'Trending', tag_color: 'red', sort_order: 2, show_in_home: true, is_tour_type: true },
      { name: 'Budget', tag_color: 'orange', sort_order: 3, show_in_home: true, is_tour_type: true },
      { name: 'Popular', tag_color: 'blue', sort_order: 4, show_in_home: true, is_tour_type: true },
      { name: 'In Season', tag_color: 'green', sort_order: 5, show_in_home: true, is_tour_type: true }
    ]) {
      categories[category.name] = await findOrCreateCategory(category, transaction);
    }

    const helpers = { categories };
    const menuDestinations = [
      { name: 'Maldives', country: 'Maldives', city: 'Male', continent: 'Asia', badge: 'Honeymoon', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80' },
      { name: 'Bali', country: 'Indonesia', city: 'Denpasar', continent: 'Asia', badge: 'Trending', is_customizable: true, is_trending: true, feature_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
      { name: 'Thailand', country: 'Thailand', city: 'Bangkok', continent: 'Asia', badge: 'Budget', is_customizable: true, is_visa_free: true, feature_image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80' },
      { name: 'Abu Dhabi', country: 'United Arab Emirates', city: 'Abu Dhabi', continent: 'Asia', badge: 'Popular', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80' },
      { name: 'Europe', country: 'France', city: 'Paris', continent: 'Europe', badge: 'In Season', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80' },
      { name: 'Dubai', country: 'United Arab Emirates', city: 'Dubai', continent: 'Asia', is_customizable: true, is_trending: true, feature_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
      { name: 'Vietnam', country: 'Vietnam', city: 'Hanoi', continent: 'Asia', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80' }
    ];

    const holidayDestinations = [
      { name: 'Singapore', country: 'Singapore', city: 'Singapore', continent: 'Asia', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80' },
      { name: 'Australia', country: 'Australia', city: 'Sydney', continent: 'Oceania', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80' },
      { name: 'Azerbaijan', country: 'Azerbaijan', city: 'Baku', continent: 'Asia', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1600209142000-aa256622e64a?auto=format&fit=crop&w=900&q=80' },
      { name: 'Malaysia', country: 'Malaysia', city: 'Kuala Lumpur', continent: 'Asia', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80' },
      { name: 'Philippines', country: 'Philippines', city: 'Manila', continent: 'Asia', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80' },
      { name: 'Seychelles', country: 'Seychelles', city: 'Victoria', continent: 'Africa', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80' },
      { name: 'New Zealand', country: 'New Zealand', city: 'Auckland', continent: 'Oceania', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=900&q=80' },
      { name: 'South Africa', country: 'South Africa', city: 'Cape Town', continent: 'Africa', is_customizable: true, feature_image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80' }
    ];

    const packageDestinations = [];
    for (const data of [...menuDestinations, ...holidayDestinations]) {
      const destination = await upsertDestination(data, helpers, transaction);
      if (data.is_customizable) packageDestinations.push(destination);
    }

    for (let index = 0; index < packageDestinations.length; index += 1) {
      await upsertPackage(packageDestinations[index], index, transaction);
    }

    await transaction.commit();
    console.log(`Seeded ${packageDestinations.length} customizable destinations and sample packages.`);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();
