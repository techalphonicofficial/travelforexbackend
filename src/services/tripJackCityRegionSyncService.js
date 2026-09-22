class TripJackCityRegionSyncService {
    constructor(tripJackClient, tripJackCityRegionModel) {
        this.tripJackClient = tripJackClient;
        this.tripJackCityRegionModel = tripJackCityRegionModel;
    }

    /**
     * Fetch one page of city/region static data from TripJack.
     *
     * @param {string} [cursor]
     * @returns {Promise<Object>}
     */
    async fetchPage(cursor) {
        const params = { limit: 2000 };

        if (cursor) {
            params.cursor = cursor;
        }

        return this.tripJackClient.get(
            '/hms/v3/content/fetch-city-regionIds',
            { params }
        );
    }

    /**
     * Sync the full TripJack city/region catalogue into the local DB.
     * Loops using the cursor until TripJack reports no more pages.
     *
     * @returns {Promise<{ pagesSynced: number, recordsSynced: number }>}
     */
    async syncAll() {
        let cursor;
        let pagesSynced = 0;
        let recordsSynced = 0;
        let hasMore = true;

        while (hasMore) {
            const response = await this.fetchPage(cursor);
            const rows = response?.hotelCityRegionIds || [];

            if (rows.length > 0) {
                await this.tripJackCityRegionModel.bulkCreate(
                    rows.map((row) => ({
                        cityRegionId: row.cityRegionId,
                        cityName: row.cityName,
                        regionName: row.regionName,
                        countryName: row.countryName,
                        regionType: row.regionType,
                        fullRegionName: row.fullRegionName
                    })),
                    {
                        updateOnDuplicate: [
                            'cityName',
                            'regionName',
                            'countryName',
                            'regionType',
                            'fullRegionName',
                            'updatedAt'
                        ]
                    }
                );

                recordsSynced += rows.length;
            }

            pagesSynced += 1;
            hasMore = Boolean(response?.hasMore);
            cursor = response?.nextCursor;

            if (hasMore && !cursor) {
                // Safety valve — hasMore=true but no cursor given, stop instead of looping forever
                break;
            }
        }

        return { pagesSynced, recordsSynced };
    }
}

module.exports = TripJackCityRegionSyncService;