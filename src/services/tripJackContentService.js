const { Op } = require('sequelize');

class TripJackContentService {
    constructor(tripJackClient, tripJackCityRegionModel) {
        this.tripJackClient = tripJackClient;
        this.tripJackCityRegionModel = tripJackCityRegionModel;
    }

    /**
     * Search the locally cached city/region list by name.
     * Does NOT call TripJack — reads from our own DB.
     *
     * @param {string} query
     * @param {number} [limit=10]
     * @returns {Promise<Array>}
     */
    async searchCities(query, limit = 10) {
        if (!query || typeof query !== 'string' || !query.trim()) {
            throw new Error('Search query is required');
        }

        return this.tripJackCityRegionModel.findAll({
            where: {
                cityName: {
                    [Op.iLike]: `%${query.trim()}%`
                }
            },
            limit,
            order: [['cityName', 'ASC']]
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