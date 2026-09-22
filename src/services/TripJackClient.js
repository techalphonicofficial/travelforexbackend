const axios = require('axios');

class TripJackClient {
    constructor(tripJackConfigService) {
        this.tripJackConfigService = tripJackConfigService;
    }

    async request({
        method = 'GET',
        path,
        data = undefined,
        params = undefined,
        headers = {},
        service = 'hotel'
    }) {
        const config = await this.tripJackConfigService.getConfig();

        if (!path) {
            throw new Error('TripJack API path is required');
        }

        const baseUrl =
            service === 'flight'
                ? config.flightBaseUrl
                : config.hotelBaseUrl;

        if (!baseUrl) {
            throw new Error(
                `TripJack ${service} base URL is not configured`
            );
        }

        const url = `${baseUrl}/${path.replace(/^\/+/, '')}`;

        try {
            const response = await axios({
                method,
                url,
                data,
                params,
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    apikey: config.apiKey,
                    ...headers
                }
            });

            return response.data;

        }
        catch (error) {
            const tripJackError = error.response?.data;

            console.error('TripJack API Error:', {
                service,
                method,
                url,
                status: error.response?.status || null,
                error: tripJackError || error.message
            });

            const apiError = new Error(
                tripJackError?.errors?.[0]?.message ||
                tripJackError?.message ||
                error.message ||
                'TripJack API request failed'
            );

            apiError.status =
                tripJackError?.status?.httpStatus ||
                error.response?.status ||
                500;

            apiError.code =
                tripJackError?.errors?.[0]?.errCode ||
                null;

            apiError.data = tripJackError || null;

            throw apiError;
        }
    }

    async get(path, options = {}) {
        return this.request({
            ...options,
            method: 'GET',
            path
        });
    }

    async post(path, data = {}, options = {}) {
        return this.request({
            ...options,
            method: 'POST',
            path,
            data
        });
    }

    async put(path, data = {}, options = {}) {
        return this.request({
            ...options,
            method: 'PUT',
            path,
            data
        });
    }

    async hotelContent(hotelIds = []) {
        if (!Array.isArray(hotelIds) || !hotelIds.length) {
            throw new Error('TripJack hotel IDs are required');
        }

        return this.post(
            'hms/v3/content/fetch-hotel-content',
            {
                hotelIds: hotelIds.map(String)
            },
            {
                service: 'hotel'
            }
        );
    }
}

module.exports = TripJackClient;