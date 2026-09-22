class TripJackConfigService {
    constructor(ProviderConfig) {
        this.ProviderConfig = ProviderConfig;
    }

    async getConfig() {
        const config = await this.ProviderConfig.findOne({
            where: {
                provider_name: 'TRIPJACK'
            },
            order: [['updated_at', 'DESC']]
        });

        if (!config) {
            throw new Error('TripJack provider configuration not found');
        }

        const environment = String(
            config.environment || 'TEST'
        ).toUpperCase();

        if (!config.api_key) {
            throw new Error(
                'TripJack API key is not configured'
            );
        }

        if (!config.hotel_url) {
            throw new Error(
                'TripJack hotel URL is not configured'
            );
        }

        if (!config.flight_url) {
            throw new Error(
                'TripJack flight URL is not configured'
            );
        }

        return {
            providerName: config.provider_name,
            environment,
            apiKey: config.api_key,

            hotelBaseUrl: config.hotel_url.replace(/\/+$/, ''),
            flightBaseUrl: config.flight_url.replace(/\/+$/, '')
        };
    }
}

module.exports = TripJackConfigService;