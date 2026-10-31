const { randomUUID } = require('crypto');

class TripJackHotelService {
    constructor(tripJackClient, hotelIndexService = null) {
        this.tripJackClient = tripJackClient;
        this.hotelIndexService = hotelIndexService;
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

        // TripJack listing accepts at most 100 hids per call (more is a
        // schema error): split into batches and merge the results.
        const MAX_HIDS = 100;
        const MAX_BATCHES = 20;
        const CONCURRENCY = 5;
        const allHids = Array.isArray(payload.hids)
            ? [...new Set(payload.hids.map(String).filter(Boolean))]
            : null;

        let listingResponse;

        if (allHids && allHids.length > MAX_HIDS) {
            const batches = [];
            for (let i = 0; i < allHids.length && batches.length < MAX_BATCHES; i += MAX_HIDS) {
                batches.push(allHids.slice(i, i + MAX_HIDS));
            }

            const results = new Array(batches.length);
            let next = 0;
            const worker = async () => {
                while (next < batches.length) {
                    const index = next++;
                    try {
                        results[index] = await this.tripJackClient.post(
                            '/hms/v3/hotel/listing',
                            { ...listingPayload, hids: batches[index] },
                            { service: 'hotel' }
                        );
                    } catch (error) {
                        console.error('Hotel listing batch failed:', index, error.message);
                        results[index] = null;
                    }
                }
            };
            await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length) }, worker));

            const seen = new Set();
            const merged = results.flatMap((result) => {
                const list = result?.data?.hotels || result?.hotels || [];
                return Array.isArray(list) ? list : [];
            }).filter((hotel) => {
                const id = String(hotel?.hotelId || '');
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });

            if (!results.some(Boolean)) {
                throw new Error('Unable to search hotels right now. Please try again.');
            }

            listingResponse = {
                status: { success: true, httpStatus: 200 },
                hotels: merged
            };
        } else {
            listingResponse =
                await this.tripJackClient.post(
                    '/hms/v3/hotel/listing',
                    listingPayload,
                    {
                        service: 'hotel'
                    }
                );
        }

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

        const hotelIds = [...new Set(hotels
            .map((hotel) => hotel?.hotelId)
            .filter(Boolean)
            .map(String))]
            .slice(0, 1000);

        if (!hotelIds.length) {
            return {
                ...listingResponse,
                correlationId
            };
        }

        // Content API takes up to 100 ids per call: fetch in parallel batches
        const batches = [];
        for (let i = 0; i < hotelIds.length; i += 100) {
            batches.push(hotelIds.slice(i, i + 100));
        }

        const contentResults = await Promise.allSettled(
            batches.map((ids) => this.tripJackClient.hotelContent(ids))
        );

        const contentHotels = contentResults.flatMap((result) => {
            if (result.status !== 'fulfilled') {
                console.error('Hotel content API error:', result.reason?.message);
                return [];
            }
            const list = result.value?.data?.hotels || result.value?.hotels || [];
            return Array.isArray(list) ? list : [];
        });

        // remember hotel names for the search box (not awaited)
        if (this.hotelIndexService && contentHotels.length) {
            this.hotelIndexService.upsertContent(contentHotels).catch((error) =>
                console.error('Hotel name index update failed:', error.message)
            );
        }

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

            // TripJack sends one size key per image (Standard, XXL, XL, ...)
            const imageUrl = (image) => {
                const links = image?.links || {};
                return (
                    links.Standard?.href ||
                    links.XL?.href ||
                    links.XXL?.href ||
                    Object.values(links).find((link) => link?.href)?.href ||
                    null
                );
            };

            const heroImage =
                imageUrl(images.find((image) => image?.is_hero_image === true)) ||
                imageUrl(images[0]) ||
                null;

            // Send only what the pages show (raw content is ~25KB per hotel)
            const slimImages = images
                .map((image) => ({
                    caption: image?.caption || '',
                    is_hero_image: image?.is_hero_image === true,
                    url: imageUrl(image)
                }))
                .filter((image) => image.url)
                .slice(0, 40);

            return {
                ...hotel,
                image: heroImage,
                images: slimImages,
                hotelContent: {
                    tjHotelId: content.tjHotelId,
                    name: content.name,
                    star_rating: content.star_rating,
                    property_type: content.property_type,
                    locale: {
                        address: content.locale?.address,
                        coordinates: content.locale?.coordinates
                    },
                    policies: content.policies,
                    amenities: content.amenities,
                    descriptions: content.descriptions
                }
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

    async book(payload) {
        return this.tripJackClient.post(
            'oms/v3/hotel/book',
            payload,
            {
                service: 'hotel'
            }
        );
    }

    async getBookingDetails({ bookingId }) {
        // book() jaisa hi client/headers use karo, sirf endpoint badlo
        const response = await this.tripJackClient.post(
            '/oms/v3/hotel/booking-details',
            { bookingId }
        );
        return response;
    }

    async cancelBooking({ bookingId }) {
        if (!bookingId || typeof bookingId !== 'string') {
            throw new Error('Valid bookingId is required');
        }

        const response = await this.tripJackClient.post(
            `/oms/v3/hotel/cancel-booking/${encodeURIComponent(bookingId)}`,
            {},
            { service: 'hotel-booker' }
        );

        return response;
    }
}

module.exports = TripJackHotelService;