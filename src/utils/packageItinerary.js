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

function serializePackageItinerary(packageRecord) {
    const pkg = asPlainObject(packageRecord);
    if (!pkg) return pkg;

    const destinations = Array.isArray(pkg.destinations) ? pkg.destinations : [];

    return {
        ...pkg,
        destinations: destinations.map(destinationRecord => {
            const destination = asPlainObject(destinationRecord);
            const activities = destination.activities || {};
            const hotels = getHotels(activities);
            const totalDays = Math.max(parseInt(destination.nights, 10) || 1, 1);
            const serializedActivities = activitiesWithDayHotels(activities, hotels, totalDays);

            return {
                ...destination,
                activities: serializedActivities
            };
        })
    };
}

module.exports = {
    serializePackageItinerary
};
