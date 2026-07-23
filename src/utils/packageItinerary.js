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

function serializePackageItinerary(packageRecord) {
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

module.exports = {
    serializePackageItinerary,
    serializeDestinationLocation
};
