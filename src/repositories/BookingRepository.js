class BookingRepository {
    constructor(Booking, Payment, Customer, Package, CustomTrip) {
        this.Booking = Booking; // will be null
        this.Payment = Payment;
        this.Customer = Customer;
        this.Package = Package;
        this.CustomTrip = CustomTrip;
    }

    async createBooking(data) {
        // Since bookings table is dropped, we just set the custom trip's status to 'booked' (or confirmed)
        const trip = await this.CustomTrip.findByPk(data.custom_trip_id);
        if (trip) {
            await trip.update({ status: 'booked' });
        }
        return trip;
    }

    async getBookingById(id) {
        // Return CustomTrip as the booking wrapper
        return await this.CustomTrip.findByPk(id, {
            include: [
                { model: this.Customer, as: 'customer' },
                { model: this.Payment, as: 'payments' }
            ]
        });
    }

    async updateBookingStatus(id, status) {
        const trip = await this.CustomTrip.findByPk(id);
        if (trip) {
            // Map confirmed status to 'booked' to match enum ('draft', 'booked', 'cancelled')
            const dbStatus = status === 'confirmed' ? 'booked' : status;
            await trip.update({ status: dbStatus });
            return trip;
        }
        return null;
    }

    async createPayment(data) {
        return await this.Payment.create(data);
    }

    async updatePaymentStatus(id, status, gatewayResponse = null) {
        const payment = await this.Payment.findByPk(id);
        if (payment) {
            const updateData = { status };
            if (gatewayResponse) updateData.gateway_response = gatewayResponse;
            await payment.update(updateData);
            return payment;
        }
        return null;
    }
}

module.exports = BookingRepository;
