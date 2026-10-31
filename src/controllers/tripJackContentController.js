class TripJackContentController {
    constructor(tripJackContentService, tripJackCityRegionSyncService, tripJackHotelIndexService = null) {
        this.tripJackContentService = tripJackContentService;
        this.tripJackCityRegionSyncService = tripJackCityRegionSyncService;
        this.tripJackHotelIndexService = tripJackHotelIndexService;
    }

    /* Hotels by name for the search box: GET /tripjack/content/hotel-search?query=taj */
    async hotelNameSearch(req, res) {
        try {
            const query = String(req.query.query || req.query.q || '').trim().slice(0, 80);
            const hotels = this.tripJackHotelIndexService
                ? await this.tripJackHotelIndexService.search(query, {
                    limit: req.query.limit,
                    countryName: req.query.countryName || undefined
                })
                : [];

            return res.status(200).json({ success: true, data: hotels });
        } catch (error) {
            console.error('Hotel name search error:', error.message);
            return res.status(500).json({ success: false, message: 'Unable to search hotels right now', data: [] });
        }
    }

    async cityRegionSearch(req, res) {
        try {
            const { query, limit, countryName } = req.query;

            const cities = await this.tripJackContentService.searchCities(
                query,
                limit ? Number(limit) : undefined,
                countryName ? countryName : undefined
            );


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

            // index this city's hotel names in the background (once a day per city)
            if (this.tripJackHotelIndexService && Array.isArray(payload?.regionIds) && payload.regionIds.length === 1) {
                this.tripJackHotelIndexService.syncRegionInBackground(payload.regionIds[0], payload.countryName);
            }

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