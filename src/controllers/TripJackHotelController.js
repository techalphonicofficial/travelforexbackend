const { customerMessage } = require('../utils/customerSafe');

/* Customer-facing error: no supplier names or raw supplier payloads */
const fail = (res, label, error, fallback) => {
    console.error(`Hotel ${label} error:`, error?.message);
    const status = Number(error?.status) >= 400 && Number(error?.status) < 500 ? 400 : 502;
    return res.status(status).json({
        success: false,
        message: customerMessage(error?.message, fallback)
    });
};

class TripJackHotelController {
    constructor(tripJackHotelService) {
        this.tripJackHotelService = tripJackHotelService;
    }

    async listing(req, res) {
        try {
            const data = await this.tripJackHotelService.listing(req.body);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return fail(res, 'listing', error, 'Unable to search hotels right now. Please try again.');
        }
    }

    async pricing(req, res) {
        try {
            const data = await this.tripJackHotelService.pricing(req.body);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return fail(res, 'pricing', error, 'Rooms for this hotel are not available right now.');
        }
    }

    async review(req, res) {
        try {
            const data = await this.tripJackHotelService.review(req.body);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return fail(res, 'review', error, 'This room is no longer available. Please choose another room.');
        }
    }

    async getNationalities(req, res) {
        try {
            const data = await this.tripJackHotelService.getNationalities();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return fail(res, 'nationalities', error, 'Unable to load nationalities.');
        }
    }

    /*
     * Not routed: hotel booking happens only on the server after a
     * verified payment (IciciPaymentService.handleHotelBookingAfterPayment).
     */
    async bookHotel(req, res) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
}

module.exports = TripJackHotelController;
