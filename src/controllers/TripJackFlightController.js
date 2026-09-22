class TripJackFlightController {
    constructor(tripJackFlightService) {
        this.tripJackFlightService = tripJackFlightService;
    }

    async search(req, res, next) {
        try {
            const result = await this.tripJackFlightService.airSearchAll(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async fareRule(req, res, next) {
        try {
            const result = await this.tripJackFlightService.fareRule(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async review(req, res, next) {
        try {
            const result = await this.tripJackFlightService.review(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async seat(req, res, next) {
        try {
            const result = await this.tripJackFlightService.seat(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async fareValidate(req, res, next) {
        try {
            const result = await this.tripJackFlightService.fareValidate(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async book(req, res, next) {
        try {
            const result = await this.tripJackFlightService.book(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async confirmBook(req, res, next) {
        try {
            const result = await this.tripJackFlightService.confirmBook(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async bookingDetails(req, res, next) {
        try {
            const result = await this.tripJackFlightService.bookingDetails(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TripJackFlightController;