const { Op, literal } = require('sequelize');

// Popular hotel chains (shown first in the search box) and budget listings
// (shown last). Postgres regex, \m / \M = word start / end.
const POPULAR_CHAINS = [
    'taj', 'vivanta', 'ginger', 'seleqtions', 'oberoi', 'trident', 'itc', 'welcomhotel', 'fortune', 'leela',
    'marriott', 'jw marriott', 'courtyard', 'westin', 'sheraton', 'le meridien', 'renaissance', 'fairfield',
    'four points', 'st\\. regis', 'radisson', 'park inn', 'park plaza', 'hyatt', 'andaz', 'hilton', 'conrad',
    'doubletree', 'hampton', 'novotel', 'ibis', 'pullman', 'mercure', 'sofitel', 'fairmont', 'accor',
    'crowne plaza', 'holiday inn', 'intercontinental', 'indigo', 'six senses', 'ramada', 'wyndham',
    'days inn', 'howard johnson', 'lemon tree', 'keys', 'sarovar', 'royal orchid', 'regenta', 'clarks',
    'the park', 'zone by the park', 'mayfair', 'club mahindra', 'sterling', 'radisson blu', 'shangri-la',
    'kempinski', 'ritz-carlton', 'four seasons', 'anantara', 'roseate', 'the lalit', 'lalit', 'claridges',
    'raddison', 'country inn', 'best western', 'golden tulip', 'citrus', 'treehouse', 'pride'
];
const BUDGET_WORDS = ['oyo', 'fabhotel', 'fab hotel', 'treebo', 'bnb', 'homestay', 'home stay', 'apartment', 'apartments',
    'studio', 'guest house', 'guesthouse', 'hostel', 'pg', 'dormitory', 'cottage', 'flat', 'rooms', 'capital o', 'collection o'];
const words = (list) => list.map((word) => word.replace(/ /g, '\\s+')).join('|');
const BRAND_TIER_SQL = `CASE
    WHEN lower("name") ~ '\\m(${words(BUDGET_WORDS)})\\M' THEN 2
    WHEN lower("name") ~ '\\m(${words(POPULAR_CHAINS)})\\M' THEN 0
    ELSE 1 END`;

/**
 * Local index of supplier hotel names for the hotel search box.
 *
 * The supplier's mapping API returns only hotel ids per city region and the
 * content API returns names (100 ids per call), so names are collected:
 *   - from every listing response (content is fetched there anyway), and
 *   - per city region in the background the first time a city is searched
 *     (and with seeds/sync_hotel_names.js for a whole country).
 */
class TripJackHotelIndexService {
    constructor(tripJackClient, tripJackHotelIndexModel) {
        this.tripJackClient = tripJackClient;
        this.model = tripJackHotelIndexModel;
        this.regionSyncs = new Map(); // regionId -> running promise
        this.syncedRegions = new Map(); // regionId -> time of the last full sync
    }

    /* supplier content row -> index row */
    static toRow(content, cityRegionId = null) {
        const id = content?.tjHotelId || content?.hotelId;
        const name = String(content?.name || '').trim();
        if (!id || !name) return null;
        const address = content?.locale?.address || {};
        const star = Number(content?.star_rating);
        return {
            tjHotelId: String(id),
            name: name.slice(0, 255),
            cityName: address.city || address.region || null,
            stateName: address.statename || null,
            countryName: address.countryname || null,
            cityRegionId: cityRegionId ? Number(cityRegionId) : null,
            starRating: Number.isFinite(star) && star > 0 ? star : null,
            propertyType: content?.property_type?.name || null
        };
    }

    /* save names; an existing region id is not overwritten with null */
    async upsertContent(contents = [], cityRegionId = null) {
        const rows = contents.map((content) => TripJackHotelIndexService.toRow(content, cityRegionId)).filter(Boolean);
        if (!rows.length) return 0;
        const fields = ['name', 'cityName', 'stateName', 'countryName', 'starRating', 'propertyType', 'updatedAt'];
        await this.model.bulkCreate(rows, {
            updateOnDuplicate: cityRegionId ? [...fields, 'cityRegionId'] : fields
        });
        return rows.length;
    }

    /*
     * Hotels for the search box. Every word must appear in "name city"
     * ("radisson noida" works). Ranking (matchRank): exact name 0, name
     * starts with the text 1, a word of the name starts with it 2, other
     * matches 3; then higher star rating, then shorter names.
     */
    async search(query, { limit = 8, countryName } = {}) {
        const text = String(query || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
        if (text.length < 3) return [];
        const esc = (value) => value.replace(/[%_\\]/g, (char) => `\\${char}`);
        const escape = (value) => this.model.sequelize.escape(value);
        const words = [...new Set(text.split(' ').filter(Boolean))].slice(0, 6);
        // same expression as the trigram index in the migration
        const haystack = `lower("name" || ' ' || coalesce("cityName", ''))`;
        // same scale as the city search (+1.5 outside India) so both can be mixed
        // the text as a word anywhere in the name ranks the same as at the
        // start, so stars decide: "noida" -> Crowne Plaza … Noida before
        // "Noida BNB"
        const rankSql = `(CASE
            WHEN lower("name") = ${escape(text)} THEN 0
            WHEN lower("name") LIKE ${escape(`${esc(text)}%`)} THEN 1
            WHEN lower("name") LIKE ${escape(`% ${esc(text)}%`)} THEN 1
            WHEN lower("name") LIKE ${escape(`${esc(words[0])}%`)} THEN 1
            WHEN lower("name") LIKE ${escape(`% ${esc(words[0])}%`)} THEN 2
            ELSE 3 END
            + CASE WHEN lower(coalesce("countryName", '')) = 'india' THEN 0 ELSE 1.5 END)`;

        const rows = await this.model.findAll({
            where: {
                [Op.and]: words.map((word) => literal(`${haystack} LIKE ${escape(`%${esc(word)}%`)}`)),
                ...(countryName && { countryName: { [Op.iLike]: countryName } })
            },
            attributes: ['tjHotelId', 'name', 'cityName', 'stateName', 'countryName', 'starRating', 'propertyType', [literal(rankSql), 'matchRank']],
            order: [
                [literal(rankSql), 'ASC'],
                // well-known chains before budget listings (supplier star ratings are unreliable)
                [literal(BRAND_TIER_SQL), 'ASC'],
                ['starRating', 'DESC NULLS LAST'],
                [literal('LENGTH("name")'), 'ASC'],
                ['name', 'ASC']
            ],
            // a few extra: the supplier lists some hotels twice under different ids
            limit: Math.min(Math.max(Number(limit) || 8, 1), 20) + 5,
            raw: true
        });
        const seen = new Set();
        return rows
            .filter((row) => {
                const key = `${String(row.name).trim().toLowerCase()}|${String(row.cityName || '').toLowerCase()}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, Math.min(Math.max(Number(limit) || 8, 1), 20))
            .map((row) => ({ ...row, matchRank: Number(row.matchRank) }));
    }

    /**
     * Index every hotel of a city region (background, once per region per day).
     * Only hotels missing from the index are fetched from the content API.
     */
    syncRegionInBackground(regionId, countryName) {
        const key = String(regionId || '');
        if (!key) return;
        const last = this.syncedRegions.get(key) || 0;
        if (this.regionSyncs.has(key) || Date.now() - last < 24 * 60 * 60 * 1000) return;

        const run = this.syncRegion(key, countryName)
            .then((result) => {
                this.syncedRegions.set(key, Date.now());
                console.log('Hotel name index synced:', { regionId: key, ...result });
            })
            .catch((error) => console.error('Hotel name index sync failed:', key, error.message))
            .finally(() => this.regionSyncs.delete(key));
        this.regionSyncs.set(key, run);
    }

    async syncRegion(regionId, countryName, options = {}) {
        return this.syncMapping({ regionIds: [String(regionId)], ...(countryName && { countryName }) }, regionId, options);
    }

    /* every hotel of a country (seeds/sync_hotel_names.js) */
    async syncCountry(countryName, options = {}) {
        return this.syncMapping({ countryName }, null, { maxHotels: 500000, ...options });
    }

    async syncMapping(filter, regionId = null, { maxHotels = 20000, concurrency = 2, onProgress } = {}) {
        const ids = [];
        for (let page = 0; ids.length < maxHotels; page += 1) {
            const response = await this.tripJackClient.post('/hms/v3/content/fetch-hotel-mapping', {
                ...filter,
                page,
                size: 2000
            });
            const hotels = response?.hotels || response?.data?.hotels || [];
            hotels.forEach((hotel) => hotel?.tjHotelId && ids.push(String(hotel.tjHotelId)));
            const totalPages = Number(response?.pageable?.totalPages ?? response?.data?.pageable?.totalPages ?? 0);
            if (!hotels.length || page + 1 >= totalPages) break;
        }

        // skip hotels already indexed (for a region: already tagged with it)
        const known = new Set();
        for (let i = 0; i < ids.length; i += 5000) {
            const rows = await this.model.findAll({
                where: {
                    tjHotelId: { [Op.in]: ids.slice(i, i + 5000) },
                    ...(regionId && { cityRegionId: Number(regionId) })
                },
                attributes: ['tjHotelId'],
                raw: true
            });
            rows.forEach((row) => known.add(row.tjHotelId));
        }
        const missing = ids.filter((id) => !known.has(id));

        const batches = [];
        for (let i = 0; i < missing.length; i += 100) batches.push(missing.slice(i, i + 100));

        let saved = 0;
        let failed = 0;
        let next = 0;
        const worker = async () => {
            while (next < batches.length) {
                const batch = batches[next++];
                try {
                    const response = await this.tripJackClient.hotelContent(batch);
                    const list = response?.hotels || response?.data?.hotels || [];
                    // await first: "saved += await" would lose counts between the workers
                    const count = await this.upsertContent(Array.isArray(list) ? list : [], regionId);
                    saved += count;
                } catch (error) {
                    failed += 1;
                    console.error('Hotel name index batch failed:', regionId || filter.countryName, error.message);
                }
                onProgress?.({ done: next, batches: batches.length, saved, failed });
            }
        };
        await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, worker));

        return { hotels: ids.length, alreadyIndexed: known.size, saved, failedBatches: failed };
    }
}

module.exports = TripJackHotelIndexService;
