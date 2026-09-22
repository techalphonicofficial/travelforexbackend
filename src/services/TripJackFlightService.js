class TripJackFlightService {
    constructor(tripJackClient) {
        this.tripJackClient = tripJackClient;
    }

    async airSearchAll(payload) {
        return this.tripJackClient.post(
            '/fms/v1/air-search-all',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async fareRule(payload) {
        return this.tripJackClient.post(
            '/fms/v2/farerule',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async review(payload) {
        try {
            const response = await this.tripJackClient.post(
                '/fms/v1/review',
                payload,
                {
                    service: 'flight'
                }
            );

            return response;
        } catch (error) {
            console.error('Error in review:', error);

            return {
                success: false,
                message: error.message || 'Flight review failed',
                error: error.data || null
            };
        }
    }

    async seat(payload) {
        return this.tripJackClient.post(
            '/fms/v1/seat',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async fareValidate(payload) {
        return this.tripJackClient.post(
            '/oms/v1/air/book/fare-validate',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async book(payload) {
        return this.tripJackClient.post(
            '/oms/v1/air/book',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async confirmBook(payload) {
        return this.tripJackClient.post(
            '/oms/v1/air/confirm-book',
            payload,
            {
                service: 'flight'
            }
        );
    }

    async bookingDetails(payload) {
        return this.tripJackClient.post(
            '/oms/v1/booking-details',
            payload,
            {
                service: 'flight'
            }
        );
    }
}

module.exports = TripJackFlightService;