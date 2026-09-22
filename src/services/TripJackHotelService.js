const { randomUUID } = require('crypto');

class TripJackHotelService {
    constructor(tripJackClient) {
        this.tripJackClient = tripJackClient;
    }

    async listing(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Hotel listing payload is required');
        }

        const correlationId =
            payload.correlationId || randomUUID();

        const listingPayload = {
            ...payload,
            correlationId
        };

        const listingResponse =
            await this.tripJackClient.post(
                '/hms/v3/hotel/listing',
                listingPayload,
                {
                    service: 'hotel'
                }
            );

        const hotels =
            listingResponse?.data?.hotels ||
            listingResponse?.hotels ||
            [];

        if (!Array.isArray(hotels) || !hotels.length) {
            return {
                ...listingResponse,
                correlationId
            };
        }

        const hotelIds = hotels
            .map((hotel) => hotel?.hotelId)
            .filter(Boolean)
            .map(String)
            .slice(0, 100);

        if (!hotelIds.length) {
            return {
                ...listingResponse,
                correlationId
            };
        }

        let contentResponse;

        try {
            contentResponse =
                await this.tripJackClient.hotelContent(
                    hotelIds
                );
        } catch (error) {
            console.error(
                'TripJack hotel content API error:',
                error.message
            );

            return {
                ...listingResponse,
                correlationId
            };
        }

        const contentHotels =
            contentResponse?.data?.hotels ||
            contentResponse?.hotels ||
            [];

        const contentMap = new Map();

        if (Array.isArray(contentHotels)) {
            contentHotels.forEach((hotel) => {
                const hotelId =
                    hotel?.hotelId ||
                    hotel?.tjHotelId;

                if (hotelId) {
                    contentMap.set(
                        String(hotelId),
                        hotel
                    );
                }
            });
        }

        const mergedHotels = hotels.map((hotel) => {
            const content =
                contentMap.get(
                    String(hotel.hotelId)
                );

            if (!content) {
                return hotel;
            }

            const images =
                Array.isArray(content.images)
                    ? content.images
                    : [];

            const heroImage =
                images.find(
                    (image) =>
                        image?.is_hero_image === true
                )?.links?.Standard?.href ||
                images[0]?.links?.Standard?.href ||
                null;

            return {
                ...hotel,
                image: heroImage,
                images,
                hotelContent: content
            };
        });

        if (listingResponse?.data?.hotels) {
            return {
                ...listingResponse,
                correlationId,
                data: {
                    ...listingResponse.data,
                    hotels: mergedHotels
                }
            };
        }

        return {
            ...listingResponse,
            correlationId,
            hotels: mergedHotels
        };
    }

    async pricing(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new Error(
                'Hotel pricing payload is required'
            );
        }

        if (!payload.correlationId) {
            throw new Error(
                'correlationId is required for hotel pricing'
            );
        }

        return this.tripJackClient.post(
            '/hms/v3/hotel/pricing',
            payload,
            {
                service: 'hotel'
            }
        );
    }

    async review(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new Error(
                'Hotel review payload is required'
            );
        }

        if (!payload.correlationId) {
            throw new Error(
                'correlationId is required for hotel review'
            );
        }

        return this.tripJackClient.post(
            '/hms/v3/hotel/review',
            payload,
            {
                service: 'hotel'
            }
        );
    }

    async getNationalities() {
        return this.tripJackClient.get(
            'hms/v3/nationality-info',
            {
                service: 'hotel'
            }
        );
    }
}

module.exports = TripJackHotelService;