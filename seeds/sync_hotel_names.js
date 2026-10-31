/**
 * Fill the hotel name index (hotel search box).
 * Cities are also indexed automatically the first time someone searches them.
 *
 *   node seeds/sync_hotel_names.js                 # INDIA
 *   node seeds/sync_hotel_names.js "UNITED ARAB EMIRATES"
 *   node seeds/sync_hotel_names.js ALL             # every country (India first)
 *   node seeds/sync_hotel_names.js POPULAR         # big Indian cities only (quick)
 *
 * Needs the tripjack_hotel_index table: run "npm run migrate" first.
 * Only hotels missing from the index are fetched, so it is safe to stop and
 * run again (it continues where it left off).
 */
require('dotenv').config();

const { fn, col } = require('sequelize');
const container = require('../src/container');
const TripJackCityRegion = require('../src/models/TripJackCityRegion');

const arg = (process.argv[2] || 'INDIA').toUpperCase();

const countriesToSync = async () => {
    if (arg !== 'ALL') return [arg];
    // countries known from the synced city/region list
    const rows = await TripJackCityRegion.findAll({
        attributes: [[fn('DISTINCT', col('countryName')), 'countryName']],
        raw: true
    });
    const names = rows.map((row) => row.countryName).filter(Boolean).sort();
    return ['INDIA', ...names.filter((name) => name !== 'INDIA')];
};

// main tourist / business destinations: indexed first so well-known hotels
// (Taj, Radisson, Hyatt, Marriott, ...) show up quickly
const POPULAR_CITIES = [
    'NEW DELHI', 'DELHI', 'MUMBAI', 'BENGALURU', 'GOA', 'NOIDA', 'GREATER NOIDA', 'GURUGRAM', 'GURGAON',
    'JAIPUR', 'AGRA', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'UDAIPUR', 'LUCKNOW', 'AHMEDABAD',
    'CHANDIGARH', 'SHIMLA', 'MANALI', 'VARANASI', 'AMRITSAR', 'KOCHI', 'MYSURU', 'RISHIKESH',
    'JODHPUR', 'JAISALMER', 'DARJEELING', 'OOTY', 'MUNNAR', 'SRINAGAR', 'LEH', 'NAINITAL', 'MUSSOORIE',
    'DEHRADUN', 'HARIDWAR', 'KATRA', 'SHIRDI', 'TIRUPATI', 'MADURAI', 'COIMBATORE', 'VISAKHAPATNAM',
    'BHUBANESWAR', 'PURI', 'GANGTOK', 'GUWAHATI', 'INDORE', 'BHOPAL', 'NAGPUR', 'SURAT', 'VADODARA'
];

const syncPopularCities = async (service) => {
    const { Op } = require('sequelize');
    const regions = await TripJackCityRegion.findAll({
        where: { countryName: 'INDIA', cityName: { [Op.in]: POPULAR_CITIES } },
        raw: true
    });
    // one region per city: the widest one (vicinity / state) first
    const typeOrder = { MULTI_CITY_VICINITY: 0, PROVINCE_STATE: 1, CITY: 2 };
    const byCity = new Map();
    regions
        .sort((a, b) => (typeOrder[a.regionType] ?? 3) - (typeOrder[b.regionType] ?? 3))
        .forEach((region) => { if (!byCity.has(region.cityName)) byCity.set(region.cityName, region); });

    const totals = { hotels: 0, saved: 0, failedBatches: 0 };
    for (const [index, region] of [...byCity.values()].entries()) {
        console.log(`[${index + 1}/${byCity.size}] ${region.fullRegionName} (${region.regionType} ${region.cityRegionId})`);
        try {
            const result = await service.syncRegion(region.cityRegionId, 'INDIA', { concurrency: 2 });
            console.log('  ', result);
            totals.hotels += result.hotels;
            totals.saved += result.saved;
            totals.failedBatches += result.failedBatches;
        } catch (error) {
            console.log(`   skipped: ${error.message}`);
        }
    }
    console.log('\nPopular cities done:', totals);
};

(async () => {
    const { tripJackHotelIndexService } = container.services;
    if (arg === 'POPULAR') {
        await syncPopularCities(tripJackHotelIndexService);
        process.exit(0);
    }
    const countries = await countriesToSync();
    console.log(`Indexing hotel names for ${countries.length} countr${countries.length === 1 ? 'y' : 'ies'}`);

    const totals = { hotels: 0, saved: 0, failedBatches: 0 };
    for (const [index, countryName] of countries.entries()) {
        console.log(`\n[${index + 1}/${countries.length}] ${countryName}`);
        let lastLog = 0;
        try {
            const result = await tripJackHotelIndexService.syncCountry(countryName, {
                concurrency: 2,
                onProgress: ({ done, batches, saved, failed }) => {
                    if (Date.now() - lastLog > 10000 || done === batches) {
                        lastLog = Date.now();
                        console.log(`  ${done}/${batches} batches, ${saved} saved, ${failed} failed`);
                    }
                }
            });
            console.log('  done:', result);
            totals.hotels += result.hotels;
            totals.saved += result.saved;
            totals.failedBatches += result.failedBatches;
        } catch (error) {
            console.log(`  skipped: ${error.message}`);
        }
    }
    console.log('\nAll done:', totals);
    process.exit(0);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
