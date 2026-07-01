/**
 * Complete Seeder - RBAC + Travel Data
 */
require('dotenv').config();
const sequelize = require('../src/database');
const bcrypt = require('bcryptjs');
const { DEFAULT_THEME_PRESETS } = require('../src/utils/themeColours');

// Load all models via container (loads associations too)
const {
  User, Role, Module, Permission, RolePermission,
  Continent, Country, City,
  Destination, DestinationMapping,
  Category, DestinationCategory,
  Package, PackageDestination, PackageInclusion, PackageExclusion,
  Activity, AppSetting, Theme, VideoReview
} = require('../src/container').models;

const seed = async () => {
  try {
    console.log('\n🌱 Starting seed process...\n');

    // ─── CLEAR DATA ────────────────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await sequelize.query(`
      TRUNCATE TABLE
        video_reviews, package_exclusions, package_inclusions, package_destinations, packages,
        destination_mappings, destination_categories,
        activities, cities, countries, continents,
        destinations, categories,
        users, role_permissions, permissions, roles, modules, themes, app_settings
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Data cleared.\n');

    // ─── APP SETTINGS ──────────────────────────────────────────────────────────
    await AppSetting.bulkCreate([
      { key: 'app_name', value: 'Travel & Forex Dashboard' },
      { key: 'app_version', value: '1.0.0' },
      { key: 'currency', value: 'INR' },
      { key: 'timezone', value: 'Asia/Kolkata' },
      { key: 'forex_service_charge_type', value: 'percent' },
      { key: 'forex_service_charge_value', value: '0.00' },
      { key: 'tax_types', value: '[{"name":"GST","percent":5},{"name":"IGST","percent":18},{"name":"SGST","percent":9},{"name":"CGST","percent":9}]' }
    ]);
    console.log('✅ App settings seeded.');

    await Theme.bulkCreate(DEFAULT_THEME_PRESETS);
    console.log('✅ Themes seeded.');

    // ─── MODULES ───────────────────────────────────────────────────────────────
    const modules = await Module.bulkCreate([
      { name: 'Dashboard' },
      { name: 'User Management' },
      { name: 'Travel' },
      { name: 'Forex' },
      { name: 'Reports' }
    ]);
    console.log('✅ Modules seeded.');

    // ─── ROLES ─────────────────────────────────────────────────────────────────
    const roles = await Role.bulkCreate([
      { name: 'Admin', description: 'Full system access' },
      { name: 'Manager', description: 'Can manage specialized departments' },
      { name: 'Employee', description: 'Limited access' }
    ]);
    const adminRole = roles.find(r => r.name === 'Admin');
    const managerRole = roles.find(r => r.name === 'Manager');
    const employeeRole = roles.find(r => r.name === 'Employee');
    console.log('✅ Roles seeded.');

    // ─── PERMISSIONS ───────────────────────────────────────────────────────────
    const userModule = modules.find(m => m.name === 'User Management');
    const travelModule = modules.find(m => m.name === 'Travel');

    const permissions = await Permission.bulkCreate([
      { name: 'view_users', module_id: userModule.id },
      { name: 'create_user', module_id: userModule.id },
      { name: 'edit_user', module_id: userModule.id },
      { name: 'delete_user', module_id: userModule.id },
      { name: 'view_packages', module_id: travelModule.id },
      { name: 'create_package', module_id: travelModule.id },
      { name: 'edit_package', module_id: travelModule.id },
      { name: 'delete_package', module_id: travelModule.id }
    ]);
    console.log('✅ Permissions seeded.');

    // ─── ROLE PERMISSIONS ──────────────────────────────────────────────────────
    // Admin gets all
    await RolePermission.bulkCreate(
      permissions.map(p => ({ role_id: adminRole.id, permission_id: p.id }))
    );
    // Manager gets view + travel
    const managerPerms = permissions.filter(p =>
      ['view_users', 'view_packages', 'create_package', 'edit_package'].includes(p.name)
    );
    await RolePermission.bulkCreate(
      managerPerms.map(p => ({ role_id: managerRole.id, permission_id: p.id }))
    );
    // Employee gets view only
    const employeePerms = permissions.filter(p =>
      ['view_users', 'view_packages'].includes(p.name)
    );
    await RolePermission.bulkCreate(
      employeePerms.map(p => ({ role_id: employeeRole.id, permission_id: p.id }))
    );
    console.log('✅ Role permissions assigned.');

    // ─── USERS ─────────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('admin@1234', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    const users = await User.bulkCreate([
      { name: 'System Admin', email: 'admin@example.com', password: hashedPassword, role_id: adminRole.id, status: true, type: 'employee' },
      { name: 'Department Manager', email: 'manager@example.com', password: managerPassword, role_id: managerRole.id, status: true, type: 'employee' },
      { name: 'Regular Employee', email: 'employee@example.com', password: employeePassword, role_id: employeeRole.id, status: true, type: 'employee' }
    ]);
    console.log('✅ Users seeded.');

    // ─── CONTINENTS ────────────────────────────────────────────────────────────
    const continents = await Continent.bulkCreate([
      { name: 'Asia' },
      { name: 'Europe' }
    ]);
    const asia = continents.find(c => c.name === 'Asia');
    const europe = continents.find(c => c.name === 'Europe');
    console.log('✅ Continents seeded.');

    // ─── COUNTRIES ─────────────────────────────────────────────────────────────
    const countries = await Country.bulkCreate([
      { name: 'India', continent_id: asia.id },
      { name: 'Thailand', continent_id: asia.id },
      { name: 'United Arab Emirates', continent_id: asia.id },
      { name: 'France', continent_id: europe.id },
      { name: 'Switzerland', continent_id: europe.id }
    ]);
    const india = countries.find(c => c.name === 'India');
    const thailand = countries.find(c => c.name === 'Thailand');
    const uae = countries.find(c => c.name === 'United Arab Emirates');
    const france = countries.find(c => c.name === 'France');
    const swiss = countries.find(c => c.name === 'Switzerland');
    console.log('✅ Countries seeded.');

    // ─── CITIES ────────────────────────────────────────────────────────────────
    const cities = await City.bulkCreate([
      { name: 'Goa', country_id: india.id },
      { name: 'Bangkok', country_id: thailand.id },
      { name: 'Dubai', country_id: uae.id },
      { name: 'Paris', country_id: france.id },
      { name: 'Interlaken', country_id: swiss.id }
    ]);
    const goa = cities.find(c => c.name === 'Goa');
    const bangkok = cities.find(c => c.name === 'Bangkok');
    const dubai = cities.find(c => c.name === 'Dubai');
    const paris = cities.find(c => c.name === 'Paris');
    const interlaken = cities.find(c => c.name === 'Interlaken');
    console.log('✅ Cities seeded.');

    // ─── CATEGORIES ────────────────────────────────────────────────────────────
    const categories = await Category.bulkCreate([
      { name: 'Beach', slug: 'beach', tag_color: '#0ea5e9', show_in_home: true, is_tour_type: true },
      { name: 'Adventure', slug: 'adventure', tag_color: '#f97316', show_in_home: true, is_tour_type: true },
      { name: 'Luxury', slug: 'luxury', tag_color: '#eab308', show_in_home: true, is_tour_type: true },
      { name: 'Honeymoon', slug: 'honeymoon', tag_color: '#ec4899', show_in_home: true, is_tour_type: true }
    ]);
    const beach = categories.find(c => c.name === 'Beach');
    const adventure = categories.find(c => c.name === 'Adventure');
    const luxury = categories.find(c => c.name === 'Luxury');
    const honeymoon = categories.find(c => c.name === 'Honeymoon');
    console.log('✅ Categories seeded.');

    // ─── DESTINATIONS ──────────────────────────────────────────────────────────
    const destinations = await Destination.bulkCreate([
      { name: 'Goa', title: 'Sun, Sand & Beach', type: 'domestic', slug: 'goa', feature_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', is_trending: true, customize: true },
      { name: 'Bangkok', title: 'City of Angels', type: 'international', slug: 'bangkok', feature_image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', is_trending: true, is_visa_free: true, customize: false },
      { name: 'Dubai', title: 'Future of Tourism', type: 'international', slug: 'dubai', feature_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', is_trending: true, customize: false },
      { name: 'Paris', title: 'City of Love', type: 'international', slug: 'paris', feature_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', is_trending: true, customize: false },
      { name: 'Switzerland', title: 'Paradise on Earth', type: 'international', slug: 'switzerland', feature_image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80', is_trending: true, customize: true }
    ]);
    const destGoa = destinations.find(d => d.name === 'Goa');
    const destBkk = destinations.find(d => d.name === 'Bangkok');
    const destDubai = destinations.find(d => d.name === 'Dubai');
    const destParis = destinations.find(d => d.name === 'Paris');
    const destSwiss = destinations.find(d => d.name === 'Switzerland');
    console.log('✅ Destinations seeded.');

    // ─── DESTINATION MAPPINGS ──────────────────────────────────────────────────
    await DestinationMapping.bulkCreate([
      { destination_id: destGoa.id, continent_id: asia.id, country_id: india.id, city_id: goa.id },
      { destination_id: destBkk.id, continent_id: asia.id, country_id: thailand.id, city_id: bangkok.id },
      { destination_id: destDubai.id, continent_id: asia.id, country_id: uae.id, city_id: dubai.id },
      { destination_id: destParis.id, continent_id: europe.id, country_id: france.id, city_id: paris.id },
      { destination_id: destSwiss.id, continent_id: europe.id, country_id: swiss.id, city_id: interlaken.id }
    ]);
    console.log('✅ Destination mappings seeded.');

    // ─── DESTINATION CATEGORIES ────────────────────────────────────────────────
    await DestinationCategory.bulkCreate([
      { destination_id: destGoa.id, category_id: beach.id },
      { destination_id: destGoa.id, category_id: honeymoon.id },
      { destination_id: destBkk.id, category_id: adventure.id },
      { destination_id: destDubai.id, category_id: luxury.id },
      { destination_id: destParis.id, category_id: honeymoon.id },
      { destination_id: destSwiss.id, category_id: adventure.id }
    ]);
    console.log('✅ Destination categories seeded.');

    // ─── ACTIVITIES ────────────────────────────────────────────────────────────
    const activities = await Activity.bulkCreate([
      { name: 'Beach Shack Dinner', description: 'Romantic dinner by the beach', city_id: goa.id },
      { name: 'Water Sports', description: 'Parasailing, jet ski & banana ride', city_id: goa.id },
      { name: 'Floating Market Tour', description: 'Visit the famous floating markets', city_id: bangkok.id },
      { name: 'Elephant Sanctuary', description: 'Ethical elephant interaction', city_id: bangkok.id },
      { name: 'Desert Safari', description: 'Dune bashing & camel ride', city_id: dubai.id },
      { name: 'Burj Khalifa Visit', description: 'Top of the world view', city_id: dubai.id },
      { name: 'Eiffel Tower Tour', description: 'Guided tour of Eiffel Tower', city_id: paris.id },
      { name: 'Swiss Alps Hiking', description: 'Scenic hike in the Alps', city_id: interlaken.id }
    ]);
    const actBeachDinner = activities.find(a => a.name === 'Beach Shack Dinner');
    const actWaterSports = activities.find(a => a.name === 'Water Sports');
    const actFloatingMkt = activities.find(a => a.name === 'Floating Market Tour');
    const actElephant = activities.find(a => a.name === 'Elephant Sanctuary');
    const actDesertSafari = activities.find(a => a.name === 'Desert Safari');
    const actEiffel = activities.find(a => a.name === 'Eiffel Tower Tour');
    const actAlpsHike = activities.find(a => a.name === 'Swiss Alps Hiking');
    console.log('✅ Activities seeded.');

    // ─── PACKAGES ──────────────────────────────────────────────────────────────
    const packages = await Package.bulkCreate([
      { name: 'Goa Beach Getaway', duration_days: 4, price: 12000, description: 'Relax on the sandy beaches of Goa', show_in_home_page: true },
      { name: 'Bangkok Explorer', duration_days: 5, price: 25000, description: 'Discover the culture and shopping of Bangkok', show_in_home_page: true },
      { name: 'Dubai Luxury Experience', duration_days: 4, price: 45000, description: 'Enjoy the futuristic and luxurious desert city', show_in_home_page: true },
      { name: 'Paris Honeymoon Special', duration_days: 6, price: 95000, description: 'A perfectly romantic honeymoon special in Paris', show_in_home_page: true },
      { name: 'Swiss Alps Adventure', duration_days: 7, price: 135000, description: 'Climb and tour the snowy peaks of Interlaken', show_in_home_page: true }
    ]);
    const pkgGoa = packages.find(p => p.name === 'Goa Beach Getaway');
    const pkgBkk = packages.find(p => p.name === 'Bangkok Explorer');
    const pkgDubai = packages.find(p => p.name === 'Dubai Luxury Experience');
    const pkgParis = packages.find(p => p.name === 'Paris Honeymoon Special');
    const pkgSwiss = packages.find(p => p.name === 'Swiss Alps Adventure');
    console.log('✅ Packages seeded.');

    // ─── PACKAGE DESTINATIONS ──────────────────────────────────────────────────
    await PackageDestination.bulkCreate([
      {
        package_id: pkgGoa.id,
        destination_id: destGoa.id,
        nights: 3,
        order: 1,
        activities: {
          "1": [
            {
              "title": "Beach Shack Dinner",
              "description": "Romantic dinner by the beach",
              "time_slot": "Evening",
              "activity_id": actBeachDinner.id
            }
          ],
          "2": [
            {
              "title": "Water Sports",
              "description": "Parasailing, jet ski & banana ride",
              "time_slot": "Morning",
              "activity_id": actWaterSports.id
            }
          ]
        }
      },
      {
        package_id: pkgBkk.id,
        destination_id: destBkk.id,
        nights: 4,
        order: 1,
        activities: {
          "1": [
            {
              "title": "Floating Market Tour",
              "description": "Visit the famous floating markets",
              "time_slot": "Morning",
              "activity_id": actFloatingMkt.id
            }
          ],
          "2": [
            {
              "title": "Elephant Sanctuary",
              "description": "Ethical elephant interaction",
              "time_slot": "Morning",
              "activity_id": actElephant.id
            }
          ]
        }
      },
      {
        package_id: pkgDubai.id,
        destination_id: destDubai.id,
        nights: 3,
        order: 1,
        activities: {
          "1": [
            {
              "title": "Desert Safari",
              "description": "Dune bashing & camel ride",
              "time_slot": "Evening",
              "activity_id": actDesertSafari.id
            }
          ]
        }
      },
      {
        package_id: pkgParis.id,
        destination_id: destParis.id,
        nights: 5,
        order: 1,
        activities: {
          "1": [
            {
              "title": "Eiffel Tower Tour",
              "description": "Guided tour of Eiffel Tower",
              "time_slot": "Afternoon",
              "activity_id": actEiffel.id
            }
          ]
        }
      },
      {
        package_id: pkgSwiss.id,
        destination_id: destSwiss.id,
        nights: 6,
        order: 1,
        activities: {
          "1": [
            {
              "title": "Swiss Alps Hiking",
              "description": "Scenic hike in the Alps",
              "time_slot": "Morning",
              "activity_id": actAlpsHike.id
            }
          ]
        }
      }
    ]);
    console.log('✅ Package destinations seeded.');

    // ─── INCLUSIONS & EXCLUSIONS ───────────────────────────────────────────────
    await PackageInclusion.bulkCreate([
      { package_id: pkgGoa.id, text: '3 Nights accommodation in a 4-star resort' },
      { package_id: pkgGoa.id, text: 'Daily breakfast & dinner' },
      { package_id: pkgBkk.id, text: '4 Nights accommodation in Bangkok' },
      { package_id: pkgDubai.id, text: '3 Nights stay with daily breakfast' },
      { package_id: pkgParis.id, text: '5 Nights stay in honeymoon suite' },
      { package_id: pkgSwiss.id, text: '6 Nights stay with Swiss travel pass' }
    ]);
    await PackageExclusion.bulkCreate([
      { package_id: pkgGoa.id, text: 'Airfare / train ticket' },
      { package_id: pkgGoa.id, text: 'Personal expenses' }
    ]);
    console.log('✅ Inclusions & Exclusions seeded.');

    // ─── VIDEO REVIEWS ─────────────────────────────────────────────────────────
    await VideoReview.bulkCreate([
      {
        title: 'Amazing Goa Trip!',
        description: 'We had an incredible time exploring Goa with Picktrails! The beach resort was perfect, water sports were super fun, and everything was perfectly managed.',
        user_name: 'Rahul Sharma',
        user_handle: '@rahul_sharma',
        user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        location: 'Goa, India',
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-shore-4131-large.mp4',
        likes_count: 142,
        status: true,
        package_id: pkgGoa.id
      },
      {
        title: 'Dubai Desert Safari was Stunning',
        description: 'Dune bashing, camel riding, and stargazing at the desert camp. Absolutely premium travel experience. Picktrails exceeded our expectations!',
        user_name: 'Anya Patel',
        user_handle: '@anya_travels',
        user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        location: 'Dubai, UAE',
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-people-riding-camels-in-the-desert-4113-large.mp4',
        likes_count: 289,
        status: true,
        package_id: pkgDubai.id
      },
      {
        title: 'Romantic Switzerland Honeymoon',
        description: 'Everything felt like a dream. Beautiful snow-capped Alps, lovely train rides, and a perfectly planned itinerary by the Picktrails team.',
        user_name: 'Priya & Kabir',
        user_handle: '@priya_kabir',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        location: 'Interlaken, Switzerland',
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-snowy-mountains-34222-large.mp4',
        likes_count: 351,
        status: true,
        package_id: pkgSwiss.id
      }
    ]);
    console.log('✅ Video reviews seeded.');

    // ─── SUMMARY ───────────────────────────────────────────────────────────────
    const videoReviews = await VideoReview.findAll();
    console.log('\n🎉 ===== SEED COMPLETED SUCCESSFULLY =====');
    console.log('📊 Summary:');
    console.log(`   Users:         3  (admin / manager / employee)`);
    console.log(`   Continents:    ${continents.length}`);
    console.log(`   Countries:     ${countries.length}`);
    console.log(`   Cities:        ${cities.length}`);
    console.log(`   Destinations:  ${destinations.length}`);
    console.log(`   Categories:    ${categories.length}`);
    console.log(`   Packages:      ${packages.length}`);
    console.log(`   Activities:    ${activities.length}`);
    console.log(`   Video Reviews: ${videoReviews.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@example.com    | Password: admin@1234');
    console.log('   Email: manager@example.com  | Password: manager123');
    console.log('   Email: employee@example.com | Password: employee123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();
