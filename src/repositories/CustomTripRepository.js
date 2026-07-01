class CustomTripRepository {
    constructor(CustomTrip, CustomTripDay, CustomTripActivity, Hotel, Activity, Destination) {
        this.CustomTrip = CustomTrip;
        this.CustomTripDay = CustomTripDay;
        this.CustomTripActivity = CustomTripActivity;
        this.Hotel = Hotel;
        this.Activity = Activity;
        this.Destination = Destination;
    }

    async createTrip(data) {
        return await this.CustomTrip.create(data);
    }

    async getTripById(id) {
        return await this.CustomTrip.findByPk(id, {
            include: [
                { model: this.Destination, as: 'destination' },
                {
                    model: this.CustomTripDay,
                    as: 'days',
                    include: [
                        { model: this.Hotel, as: 'hotel' },
                        {
                            model: this.CustomTripActivity,
                            as: 'activities',
                            include: [{ model: this.Activity, as: 'activity' }]
                        }
                    ]
                }
            ],
            order: [
                [{ model: this.CustomTripDay, as: 'days' }, 'day_number', 'ASC']
            ]
        });
    }

    async getDay(tripId, dayNumber) {
        return await this.CustomTripDay.findOne({
            where: { custom_trip_id: tripId, day_number: dayNumber }
        });
    }

    async createDay(tripId, dayNumber) {
        return await this.CustomTripDay.create({ custom_trip_id: tripId, day_number: dayNumber });
    }

    async setHotelForDay(dayId, hotelId) {
        const day = await this.CustomTripDay.findByPk(dayId);
        if (day) {
            await day.update({ hotel_id: hotelId });
            return day;
        }
        return null;
    }

    async addActivityToDay(dayId, activityId) {
        return await this.CustomTripActivity.create({ custom_trip_day_id: dayId, activity_id: activityId });
    }

    async cloneActivityToDay(dayId, title, description) {
        return await this.CustomTripActivity.create({ 
            custom_trip_day_id: dayId, 
            title: title, 
            description: description 
        });
    }

    async removeActivityFromDay(dayId, activityId) {
        const deleted = await this.CustomTripActivity.destroy({
            where: { custom_trip_day_id: dayId, id: activityId }
        });
        if (deleted) return deleted;

        return await this.CustomTripActivity.destroy({
            where: { custom_trip_day_id: dayId, activity_id: activityId }
        });
    }

    async updateTripPrice(tripId, price) {
        const trip = await this.CustomTrip.findByPk(tripId);
        if (trip) {
            await trip.update({ total_price: price });
        }
    }
}

module.exports = CustomTripRepository;
