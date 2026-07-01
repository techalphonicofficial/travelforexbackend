class TripBuilderService {
    constructor(customTripRepo, hotelRepo, activityRepo, packageRepo) {
        this.customTripRepo = customTripRepo;
        this.hotelRepo = hotelRepo;
        this.activityRepo = activityRepo;
        this.packageRepo = packageRepo;
    }

    async initializeTrip(customerId, destinationId, startDate, endDate) {
        // Calculate duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const trip = await this.customTripRepo.createTrip({
            customer_id: customerId,
            destination_id: destinationId,
            start_date: startDate,
            end_date: endDate,
            total_price: 0
        });

        // Initialize empty days
        for (let i = 1; i <= durationDays; i++) {
            await this.customTripRepo.createDay(trip.id, i);
        }

        return trip;
    }

    async clonePackageIntoTrip(customerId, packageId, startDate) {
        const pkg = await this.packageRepo.model.findByPk(packageId, {
            include: [
                {
                    association: 'destinations'
                }
            ],
            order: [
                [{ model: this.packageRepo.packageDestinationModel, as: 'destinations' }, 'order', 'ASC']
            ]
        });

        if (!pkg) throw new Error('Package not found');

        const packageDestinations = pkg.destinations || [];
        const durationDays = Math.max(parseInt(pkg.duration_days, 10) || 0, 1);
        
        // Calculate end date
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays - 1);
        const endDate = end.toISOString().split('T')[0];

        const trip = await this.customTripRepo.createTrip({
            customer_id: customerId,
            destination_id: packageDestinations.length > 0 ? packageDestinations[0].destination_id : 1,
            start_date: startDate,
            end_date: endDate,
            base_price: pkg.price || 0,
            total_price: pkg.price || 0
        });

        let globalDay = 1;
        for (const packageDestination of packageDestinations) {
            const activitiesPayload = packageDestination.activities || {};
            const dayKeys = Object.keys(activitiesPayload)
                .filter(key => /^\d+$/.test(String(key)))
                .map(key => parseInt(key, 10))
                .sort((a, b) => a - b);
            const hotels = Array.isArray(activitiesPayload._hotels)
                ? activitiesPayload._hotels
                : (Array.isArray(activitiesPayload.hotels) ? activitiesPayload.hotels : []);
            const destinationDays = Math.max(dayKeys.length, parseInt(packageDestination.nights, 10) || 1, 1);

            for (let localDay = 1; localDay <= destinationDays; localDay += 1) {
                const dayActivities = activitiesPayload[localDay] || activitiesPayload[String(localDay)] || [];
                const hotel = hotels[0] || null;
                const newDay = await this.customTripRepo.createDay(trip.id, globalDay);

                await newDay.update({
                    destination_id: packageDestination.destination_id || null,
                    title: packageDestination.destination ? packageDestination.destination.name : null,
                    description: `Day ${globalDay} from ${pkg.name || 'selected package'}`,
                    hotel_id: hotel && hotel.hotelId ? hotel.hotelId : null
                });

                if (Array.isArray(dayActivities)) {
                    for (const item of dayActivities) {
                        const title = item.name || item.title || item.description;
                        if (!title) continue;
                        const description = [item.duration, item.description]
                            .filter(Boolean)
                            .join(' - ');
                        await this.customTripRepo.cloneActivityToDay(newDay.id, title, description || null);
                    }
                }

                globalDay += 1;
            }
        }

        while (globalDay <= durationDays) {
            await this.customTripRepo.createDay(trip.id, globalDay);
            globalDay += 1;
        }

        return this.getTripDetails(trip.id);
    }

    async getTripDetails(tripId) {
        const trip = await this.customTripRepo.getTripById(tripId);
        return trip;
    }

    async setHotelForDay(tripId, dayNumber, hotelId) {
        let day = await this.customTripRepo.getDay(tripId, dayNumber);
        if (!day) {
            day = await this.customTripRepo.createDay(tripId, dayNumber);
        }
        await this.customTripRepo.setHotelForDay(day.id, hotelId);
        await this.recalculateTripPrice(tripId);
        return await this.getTripDetails(tripId);
    }

    async addActivityToDay(tripId, dayNumber, activityId) {
        let day = await this.customTripRepo.getDay(tripId, dayNumber);
        if (!day) {
            day = await this.customTripRepo.createDay(tripId, dayNumber);
        }
        await this.customTripRepo.addActivityToDay(day.id, activityId);
        await this.recalculateTripPrice(tripId);
        return await this.getTripDetails(tripId);
    }

    async removeActivityFromDay(tripId, dayNumber, activityId) {
        const day = await this.customTripRepo.getDay(tripId, dayNumber);
        if (day) {
            await this.customTripRepo.removeActivityFromDay(day.id, activityId);
            await this.recalculateTripPrice(tripId);
        }
        return await this.getTripDetails(tripId);
    }

    async recalculateTripPrice(tripId) {
        const trip = await this.customTripRepo.getTripById(tripId);
        if (!trip) return;

        let total = 0;

        for (const day of trip.days) {
            if (day.hotel && day.hotel.price_per_night) {
                total += parseFloat(day.hotel.price_per_night);
            }
            if (day.activities && day.activities.length > 0) {
                for (const tripAct of day.activities) {
                    if (tripAct.activity && tripAct.activity.price) {
                        total += parseFloat(tripAct.activity.price);
                    }
                }
            }
        }

        await this.customTripRepo.updateTripPrice(tripId, total);
    }
}

module.exports = TripBuilderService;
