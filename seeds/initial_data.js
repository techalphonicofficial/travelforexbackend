/**
 * Complete Seeder - RBAC + Travel Data
 */
require('dotenv').config();
const sequelize = require('../src/database');
const bcrypt = require('bcryptjs');

// Load all models via container (loads associations too)
const {
  User, Role, Module, Permission, RolePermission,
  Continent, Country, City,
  Destination, DestinationMapping,
  Category, DestinationCategory,
  Package, PackageDay, PackageItem,
  Activity, AppSetting
} = require('../src/container').models;

const seed = async () => {
  try {
    console.log('\n🌱 Starting seed process...\n');

    // ─── CLEAR DATA ────────────────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await sequelize.query(`
      TRUNCATE TABLE
        package_items, package_days, packages,
        destination_mappings, destination_categories,
        activities, cities, countries, continents,
        destinations, categories,
        users, role_permissions, permissions, roles, modules, app_settings
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Data cleared.\n');

    // ─── APP SETTINGS ──────────────────────────────────────────────────────────
    await AppSetting.bulkCreate([
      { key: 'app_name', value: 'Travel & Forex Dashboard' },
      { key: 'app_version', value: '1.0.0' },
      { key: 'currency', value: 'INR' },
      { key: 'timezone', value: 'Asia/Kolkata' }
    ]);
    console.log('✅ App settings seeded.');

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
    await User.bulkCreate([
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin@1234', 10),
        role_id: adminRole.id,
        status: true
      },
      {
        name: 'Test Manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        role_id: managerRole.id,
        status: true
      },
      {
        name: 'Test Employee',
        email: 'employee@example.com',
        password: await bcrypt.hash('employee123', 10),
        role_id: employeeRole.id,
        status: true
      }
    ]);
    console.log('✅ Users seeded.');


    const continents = await Continent.bulkCreate([
      { name: 'Asia' },
      { name: 'Europe' },
      { name: 'Africa' },
      { name: 'North America' },
      { name: 'South America' }
    ]);
    const asia = continents.find(c => c.name === 'Asia');
    const europe = continents.find(c => c.name === 'Europe');
    console.log('✅ Continents seeded.');

    // ─── COUNTRIES ─────────────────────────────────────────────────────────────
    const countries = await Country.bulkCreate([
      { name: 'India', continent_id: asia.id },
      { name: 'Thailand', continent_id: asia.id },
      { name: 'UAE', continent_id: asia.id },
      { name: 'France', continent_id: europe.id },
      { name: 'Switzerland', continent_id: europe.id }
    ]);
    const india = countries.find(c => c.name === 'India');
    const thailand = countries.find(c => c.name === 'Thailand');
    const uae = countries.find(c => c.name === 'UAE');
    const france = countries.find(c => c.name === 'France');
    const swiss = countries.find(c => c.name === 'Switzerland');
    console.log('✅ Countries seeded.');

    // ─── CITIES ────────────────────────────────────────────────────────────────
    const cities = await City.bulkCreate([
      { name: 'Delhi', country_id: india.id },
      { name: 'Mumbai', country_id: india.id },
      { name: 'Goa', country_id: india.id },
      { name: 'Bangkok', country_id: thailand.id },
      { name: 'Phuket', country_id: thailand.id },
      { name: 'Dubai', country_id: uae.id },
      { name: 'Paris', country_id: france.id },
      { name: 'Zurich', country_id: swiss.id },
      { name: 'Interlaken', country_id: swiss.id }
    ]);
    const delhi = cities.find(c => c.name === 'Delhi');
    const goa = cities.find(c => c.name === 'Goa');
    const bangkok = cities.find(c => c.name === 'Bangkok');
    const phuket = cities.find(c => c.name === 'Phuket');
    const dubai = cities.find(c => c.name === 'Dubai');
    const paris = cities.find(c => c.name === 'Paris');
    const interlaken = cities.find(c => c.name === 'Interlaken');
    console.log('✅ Cities seeded.');

    // ─── CATEGORIES ────────────────────────────────────────────────────────────
    const categories = await Category.bulkCreate([
      { name: 'Adventure' },
      { name: 'Beach' },
      { name: 'Honeymoon' },
      { name: 'Family' },
      { name: 'Heritage' },
      { name: 'Luxury' }
    ]);
    const adventure = categories.find(c => c.name === 'Adventure');
    const beach = categories.find(c => c.name === 'Beach');
    const honeymoon = categories.find(c => c.name === 'Honeymoon');
    const luxury = categories.find(c => c.name === 'Luxury');
    console.log('✅ Categories seeded.');

    // ─── DESTINATIONS ──────────────────────────────────────────────────────────
    const destinations = await Destination.bulkCreate([
      { name: 'Goa', type: 'beach' },
      { name: 'Bangkok', type: 'city' },
      { name: 'Dubai', type: 'luxury' },
      { name: 'Paris', type: 'heritage' },
      { name: 'Switzerland', type: 'mountain' }
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
      { name: 'Goa Beach Getaway', duration_days: 4, destination_id: destGoa.id },
      { name: 'Bangkok Explorer', duration_days: 5, destination_id: destBkk.id },
      { name: 'Dubai Luxury Experience', duration_days: 4, destination_id: destDubai.id },
      { name: 'Paris Honeymoon Special', duration_days: 6, destination_id: destParis.id },
      { name: 'Swiss Alps Adventure', duration_days: 7, destination_id: destSwiss.id }
    ]);
    const pkgGoa = packages.find(p => p.name === 'Goa Beach Getaway');
    const pkgBkk = packages.find(p => p.name === 'Bangkok Explorer');
    const pkgDubai = packages.find(p => p.name === 'Dubai Luxury Experience');
    const pkgParis = packages.find(p => p.name === 'Paris Honeymoon Special');
    const pkgSwiss = packages.find(p => p.name === 'Swiss Alps Adventure');
    console.log('✅ Packages seeded.');

    // ─── PACKAGE DAYS ──────────────────────────────────────────────────────────
    const packageDays = await PackageDay.bulkCreate([
      { package_id: pkgGoa.id, city_id: goa.id, day_number: 1 },
      { package_id: pkgGoa.id, city_id: goa.id, day_number: 2 },
      { package_id: pkgBkk.id, city_id: bangkok.id, day_number: 1 },
      { package_id: pkgBkk.id, city_id: bangkok.id, day_number: 2 },
      { package_id: pkgDubai.id, city_id: dubai.id, day_number: 1 },
      { package_id: pkgParis.id, city_id: paris.id, day_number: 1 },
      { package_id: pkgSwiss.id, city_id: interlaken.id, day_number: 1 }
    ]);
    const [goaDay1, goaDay2, bkkDay1, bkkDay2, dubaiDay1, parisDay1, swissDay1] = packageDays;
    console.log('✅ Package days seeded.');

    // ─── PACKAGE ITEMS ─────────────────────────────────────────────────────────
    await PackageItem.bulkCreate([
      { package_day_id: goaDay1.id, activity_id: actBeachDinner.id, notes: 'Sunset dinner reservation included' },
      { package_day_id: goaDay2.id, activity_id: actWaterSports.id, notes: 'All safety gear provided' },
      { package_day_id: bkkDay1.id, activity_id: actFloatingMkt.id, notes: 'Early morning tour at 6 AM' },
      { package_day_id: bkkDay2.id, activity_id: actElephant.id, notes: 'No riding, ethical sanctuary only' },
      { package_day_id: dubaiDay1.id, activity_id: actDesertSafari.id, notes: 'Evening safari with BBQ dinner' },
      { package_day_id: parisDay1.id, activity_id: actEiffel.id, notes: 'Skip-the-line tickets included' },
      { package_day_id: swissDay1.id, activity_id: actAlpsHike.id, notes: 'Guided hike with certified guide' }
    ]);
    console.log('✅ Package items seeded.');

    // ─── SUMMARY ───────────────────────────────────────────────────────────────
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
