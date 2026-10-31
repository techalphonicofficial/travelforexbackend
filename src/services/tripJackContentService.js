const { Op, literal } = require('sequelize');

class TripJackContentService {
    constructor(tripJackClient, tripJackCityRegionModel) {
        this.tripJackClient = tripJackClient;
        this.tripJackCityRegionModel = tripJackCityRegionModel;
    }

    /**
     * Search the locally cached city/region list by name (all countries).
     * Does NOT call TripJack — reads from our own DB.
     *
     * Ranking: exact name, then name starting with the text, then a word
     * starting with it, then anywhere; places outside India one and a half
     * steps lower. Within a score: cities before areas/states, shorter names
     * first. Each row gets matchRank (the score) so the search box can mix
     * cities and hotels.
     *
     * @param {string} query
     * @param {number} [limit=10]
     * @param {string} [countryName] optional country filter
     * @returns {Promise<Array>}
     */
    async searchCities(query, limit = 10, countryName) {
        if (!query || typeof query !== 'string' || !query.trim()) {
            throw new Error('Search query is required');
        }

        const text = query.trim().slice(0, 80);
        const like = text.replace(/[%_\\]/g, (char) => `\\${char}`);
        const escape = (value) => this.tripJackCityRegionModel.sequelize.escape(value);
        // match quality 0-3, +1.5 outside India (most customers search Indian
        // places: "goa" -> Goa, India before Goa, Philippines; an exact
        // foreign match still beats a weak Indian one)
        const rankSql = `(CASE
            WHEN "cityName" ILIKE ${escape(like)} THEN 0
            WHEN "cityName" ILIKE ${escape(`${like}%`)} THEN 1
            WHEN "cityName" ILIKE ${escape(`% ${like}%`)} THEN 2
            ELSE 3 END
            + CASE WHEN "countryName" = 'INDIA' THEN 0 ELSE 1.5 END)`;

        const rows = await this.tripJackCityRegionModel.findAll({
            where: {
                cityName: { [Op.iLike]: `%${like}%` },
                ...(countryName && { countryName: String(countryName).toUpperCase() })
            },
            attributes: {
                include: [[literal(rankSql), 'matchRank']]
            },
            order: [
                [literal(rankSql), 'ASC'],
                [literal(`CASE "regionType" WHEN 'CITY' THEN 0 WHEN 'MULTI_CITY_VICINITY' THEN 1 WHEN 'PROVINCE_STATE' THEN 2 ELSE 3 END`), 'ASC'],
                [literal('LENGTH("cityName")'), 'ASC'],
                ['cityName', 'ASC']
            ],
            limit: Math.min(Math.max(Number(limit) || 10, 1), 20)
        });

        return rows.map((row) => {
            const plain = row.get ? row.get({ plain: true }) : row;
            return { ...plain, matchRank: Number(plain.matchRank) };
        });
    }

    /**
     * Get TripJack hotel IDs (hids) for one or more region IDs.
     *
     * @param {Object} params
     * @param {string[]} [params.regionIds]
     * @param {string} [params.countryName]
     * @param {number} [params.page=0]
     * @param {number} [params.size=2000]
     * @returns {Promise<Object>}
     */
    async hotelIdsByRegion({ regionIds, countryName, page = 0, size = 2000 }) {
        if (!regionIds?.length && !countryName) {
            throw new Error('Either regionIds or countryName is required');
        }

        const payload = { page, size };

        if (regionIds?.length) payload.regionIds = regionIds;
        if (countryName) payload.countryName = countryName;

        return this.tripJackClient.post(
            '/hms/v3/content/fetch-hotel-mapping',
            payload
        );
    }
}

module.exports = TripJackContentService;