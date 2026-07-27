const PACKAGE_HOTELS_KEY = '_hotels';

function asPlainObject(value) {
    if (!value) return value;
    return typeof value.get === 'function' ? value.get({ plain: true }) : value;
}

function getHotels(activities) {
    if (!activities || typeof activities !== 'object' || Array.isArray(activities)) return [];

    const hotels = activities[PACKAGE_HOTELS_KEY] || activities.hotels;
    return Array.isArray(hotels) ? hotels : [];
}

function getDayActivities(activities, dayNumber) {
    if (!activities || typeof activities !== 'object' || Array.isArray(activities)) return [];

    const dayActivities = activities[String(dayNumber)] || activities[dayNumber];
    return Array.isArray(dayActivities) ? dayActivities : [];
}

function hotelDayNumber(hotel) {
    return Math.max(parseInt(hotel && (hotel.dayNumber || hotel.day_number), 10) || 1, 1);
}

function activitiesWithDayHotels(activities, hotels, totalDays) {
    const result = {};

    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
        const dayHotels = hotels.filter(hotel => hotelDayNumber(hotel) === dayNumber);
        const dayActivities = getDayActivities(activities, dayNumber);

        result[String(dayNumber)] = dayActivities.map(activity => ({
            ...activity,
            _hotels: dayHotels
        }));

        // Preserve a hotel-only day even when no activity has been added yet.
        if (!result[String(dayNumber)].length && dayHotels.length) {
            result[String(dayNumber)].push({ _hotels: dayHotels });
        }
    }

    return result;
}

function serializeDestinationLocation(destinationRecord) {
    const destination = asPlainObject(destinationRecord) || {};
    const mappings = Array.isArray(destination.mappings) ? destination.mappings : [];
    const mappedCity = mappings.map(mapping => asPlainObject(mapping)?.city).find(Boolean) || null;
    const mappedCountry = mappedCity ? asPlainObject(mappedCity.country) : null;
    const { mappings: _mappings, ...destinationData } = destination;

    return {
        ...destinationData,
        country: mappedCountry?.name || destination.country || null,
        country_id: mappedCountry?.id || mappedCity?.country_id || null,
        city: mappedCity ? {
            id: mappedCity.id,
            name: mappedCity.name,
            country_id: mappedCity.country_id || mappedCountry?.id || null
        } : null
    };
}

function getDbHotelId(hotel) {
    if (!hotel || typeof hotel !== 'object') return null;
    const raw = hotel.hotelId !== undefined ? hotel.hotelId : (hotel.hotel_id !== undefined ? hotel.hotel_id : hotel.hotel);
    const parsed = parseInt(raw, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
    const rawId = parseInt(hotel.id, 10);
    return Number.isInteger(rawId) && String(hotel.id) === String(rawId) && rawId > 0 ? rawId : null;
}

async function enrichHotelsMap(hotelsList) {
    if (!Array.isArray(hotelsList) || hotelsList.length === 0) return new Map();
    const hotelIds = [...new Set(hotelsList.map(h => getDbHotelId(h)).filter(Boolean))];
    const map = new Map();
    if (hotelIds.length === 0) return map;

    try {
        const { models } = require('../container');
        if (models && models.Hotel) {
            const dbHotels = await models.Hotel.findAll({
                where: { id: hotelIds },
                include: [{ association: 'gallery', required: false }]
            });
            dbHotels.forEach(h => {
                map.set(h.id, h.get({ plain: true }));
            });
        }
    } catch (err) {
        console.error('Error enriching package itinerary hotels:', err);
    }
    return map;
}

function enrichSingleHotel(hotelItem, dbHotelsMap) {
    if (!hotelItem || typeof hotelItem !== 'object') return hotelItem;
    const dbId = getDbHotelId(hotelItem);
    const dbHotel = dbId ? dbHotelsMap.get(dbId) : null;
    if (!dbHotel) return hotelItem;

    const coverMedia = Array.isArray(dbHotel.gallery) && dbHotel.gallery[0] ? dbHotel.gallery[0] : null;
    const resolvedImage = String(
        dbHotel.image_url ||
        (coverMedia ? coverMedia.url : null) ||
        hotelItem.image ||
        hotelItem.image_url ||
        ''
    ).trim();

    return {
        ...hotelItem,
        hotelId: dbHotel.id,
        name: dbHotel.name || hotelItem.name || '',
        image: resolvedImage,
        image_url: resolvedImage,
        starRating: Number.isInteger(parseInt(dbHotel.star_rating, 10))
            ? parseInt(dbHotel.star_rating, 10)
            : (parseInt(hotelItem.starRating || hotelItem.star_rating, 10) || 0),
        guestRating: dbHotel.guest_rating !== undefined && dbHotel.guest_rating !== null
            ? Number(dbHotel.guest_rating)
            : (Number(hotelItem.guestRating || hotelItem.guest_rating) || 0),
        pricePerNight: dbHotel.price_per_night !== undefined && dbHotel.price_per_night !== null
            ? Number(dbHotel.price_per_night)
            : (Number(hotelItem.pricePerNight || hotelItem.price_per_night) || 0),
        description: dbHotel.description || hotelItem.description || '',
        amenities: Array.isArray(dbHotel.amenities) ? dbHotel.amenities : (hotelItem.amenities || []),
        gallery: Array.isArray(dbHotel.gallery) ? dbHotel.gallery.map(m => m.url || m) : (hotelItem.gallery || [])
    };
}

function serializePackageItinerarySync(packageRecord) {
    const pkg = asPlainObject(packageRecord);
    if (!pkg) return pkg;

    const destinations = Array.isArray(pkg.destinations) ? pkg.destinations : [];

    return {
        ...pkg,
        destinations: destinations
          .slice()
          .sort((a, b) => Number(asPlainObject(a)?.order || 0) - Number(asPlainObject(b)?.order || 0))
          .map(destinationRecord => {
            const packageDestination = asPlainObject(destinationRecord);
            const activities = packageDestination.activities || {};
            const hotels = getHotels(activities);
            const totalDays = Math.max(parseInt(packageDestination.nights, 10) || 1, 1);
            const serializedActivities = activitiesWithDayHotels(activities, hotels, totalDays);

            return {
                ...packageDestination,
                destination: serializeDestinationLocation(packageDestination.destination),
                activities: serializedActivities
            };
          })
    };
}

async function serializePackageItinerary(packageRecord) {
    const pkg = asPlainObject(packageRecord);
    if (!pkg) return pkg;

    const destinations = Array.isArray(pkg.destinations) ? pkg.destinations : [];

    const allHotels = [];
    destinations.forEach(destinationRecord => {
        const packageDestination = asPlainObject(destinationRecord);
        const activities = packageDestination?.activities || {};
        const hotels = getHotels(activities);
        if (Array.isArray(hotels)) {
            hotels.forEach(h => allHotels.push(h));
        }
    });

    const enrichedHotelsMap = await enrichHotelsMap(allHotels);

    return {
        ...pkg,
        destinations: destinations
          .slice()
          .sort((a, b) => Number(asPlainObject(a)?.order || 0) - Number(asPlainObject(b)?.order || 0))
          .map(destinationRecord => {
            const packageDestination = asPlainObject(destinationRecord);
            const activities = packageDestination.activities || {};
            const rawHotels = getHotels(activities);
            const hotels = rawHotels.map(h => enrichSingleHotel(h, enrichedHotelsMap));
            const totalDays = Math.max(parseInt(packageDestination.nights, 10) || 1, 1);
            const serializedActivities = activitiesWithDayHotels(activities, hotels, totalDays);

            return {
                ...packageDestination,
                destination: serializeDestinationLocation(packageDestination.destination),
                activities: serializedActivities
            };
          })
    };
}

module.exports = {
    serializePackageItinerary,
    serializePackageItinerarySync,
    serializeDestinationLocation
};
