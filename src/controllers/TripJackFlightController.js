const { customerMessage } = require('../utils/customerSafe');

/* Customer-facing error: no supplier names or internals */
const fail = (res, error, fallback) => {
    console.error('Flight API error:', error?.message);
    const status = Number(error?.status) >= 400 && Number(error?.status) < 500 ? 400 : 502;
    return res.status(status).json({ success: false, message: customerMessage(error?.message, fallback) });
};

class TripJackFlightController {
    constructor(tripJackFlightService) {
        this.tripJackFlightService = tripJackFlightService;
    }

    async search(req, res) {
        try {
            const result = await this.tripJackFlightService.airSearchAll(req.body);
            return res.json(result);
        } catch (error) {
            return fail(res, error, 'Unable to search flights right now. Please try again.');
        }
    }

    async fareRule(req, res) {
        try {
            const result = await this.tripJackFlightService.fareRule(req.body);
            return res.json(result);
        } catch (error) {
            return fail(res, error, 'Fare rules are not available right now.');
        }
    }

    async review(req, res) {
        try {
            const result = await this.tripJackFlightService.review(req.body);
            if (result?.success === false) {
                return res.json({ ...result, message: customerMessage(result.message, 'This fare is no longer available. Please choose another flight.') });
            }
            return res.json(result);
        } catch (error) {
            return fail(res, error, 'This fare is no longer available. Please choose another flight.');
        }
    }

    async seat(req, res) {
        try {
            const result = await this.tripJackFlightService.seat(req.body);
            return res.json(result);
        } catch (error) {
            return fail(res, error, 'Seat map is not available right now.');
        }
    }

    /*
     * Server-side only (not routed publicly): booking happens after a
     * verified payment in BookingService / IciciPaymentService.
     */
    async fareValidate(req, res) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    async book(req, res) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    async confirmBook(req, res) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    async bookingDetails(req, res) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
}

module.exports = TripJackFlightController;
