class TripJackContentController {
    constructor(tripJackContentService, tripJackCityRegionSyncService) {
        this.tripJackContentService = tripJackContentService;
        this.tripJackCityRegionSyncService = tripJackCityRegionSyncService;
    }

    async cityRegionSearch(req, res) {
        try {
            const { query, limit } = req.query;

            const cities = await this.tripJackContentService.searchCities(
                query,
                limit ? Number(limit) : undefined
            );


            console.log(cities)
            return res.status(200).json({
                success: true,
                data: cities
            });
        } catch (error) {
            console.error('TripJack City Region Search Error:', error);

            return res.status(error.status || 400).json({
                success: false,
                message: error.message || 'Unable to search cities',
                data: error.data || null
            });
        }
    }

    async hotelIdsByRegion(req, res) {
        try {
            const payload = req.body;

            const data = await this.tripJackContentService.hotelIdsByRegion(payload);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('TripJack Hotel Mapping Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to fetch hotel mapping from TripJack',
                data: error.data || null
            });
        }
    }

    async syncCityRegions(req, res) {
        try {
            const result = await this.tripJackCityRegionSyncService.syncAll();

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('TripJack City Region Sync Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to sync city/region data from TripJack',
                data: error.data || null
            });
        }
    }
}

module.exports = TripJackContentController;