class TripJackHotelController {
    constructor(tripJackHotelService) {
        this.tripJackHotelService = tripJackHotelService;
    }

    async listing(req, res) {
        try {
            const payload = req.body;

            const data = await this.tripJackHotelService.listing(payload);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('TripJack Hotel Listing Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to fetch hotels from TripJack',
                data: error.data || null
            });
        }
    }

    async pricing(req, res) {
        try {
            const payload = req.body;

            const data = await this.tripJackHotelService.pricing(payload);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('TripJack Hotel Pricing Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to fetch hotel pricing from TripJack',
                data: error.data || null
            });
        }
    }

    async review(req, res) {
        try {
            const payload = req.body;

            const data = await this.tripJackHotelService.review(payload);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('TripJack Hotel Review Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to review hotel with TripJack',
                data: error.data || null
            });
        }
    }

    async getNationalities(req, res) {
        try {
            const data = await this.tripJackHotelService.getNationalities();

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('TripJack Hotel Nationalities Error:', error);

            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Unable to fetch nationalities from TripJack',
                data: error.data || null
            });
        }
    }
}

module.exports = TripJackHotelController;