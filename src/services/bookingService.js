const Booking = require('../models/Booking');

class BookingService {

    /**
     * Create initial booking record
     */
    async createBooking({
        userId = null,
        bookingType,
        provider,
        providerBookingId = null,
        providerReference = null,
        status = 'INITIATED',
        paymentStatus = 'PENDING',
        amount = null,
        currency = 'INR',
        correlationId = null,
        bookingData = null,
        paymentData = null,
    }) {

        if (!bookingType) {
            throw new Error('bookingType is required');
        }

        if (!provider) {
            throw new Error('provider is required');
        }

        const bookingReference =
            await this.generateBookingReference();

        return Booking.create({

            // DB column names
            booking_reference: bookingReference,

            user_id: userId,

            booking_type: bookingType,

            provider,

            provider_booking_id: providerBookingId,

            provider_reference: providerReference,

            status,

            payment_status: paymentStatus,

            amount,

            currency,

            correlation_id: correlationId,

            booking_data: bookingData,

            payment_data: paymentData,
        });
    }


    /**
     * Generate internal booking reference
     */
    async generateBookingReference() {

        const date = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');

        const random = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return `BK-${date}-${random}`;
    }


    /**
     * Find booking by internal ID
     */
    async findById(id) {
        return Booking.findByPk(id);
    }


    /**
     * Find booking by our booking reference
     */
    async findByBookingReference(bookingReference) {

        return Booking.findOne({
            where: {
                booking_reference: bookingReference,
            },
        });
    }


    /**
     * Find booking by provider booking ID
     */
    async findByProviderBookingId(providerBookingId) {

        return Booking.findOne({
            where: {
                provider_booking_id: providerBookingId,
            },
        });
    }


    /**
     * Update booking status
     */
    async updateStatus(id, status) {

        const booking = await this.findById(id);

        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.status = status;

        await booking.save();

        return booking;
    }


    /**
     * Update payment status
     */
    async updatePaymentStatus(
        id,
        paymentStatus,
        paymentData = null
    ) {

        const booking = await this.findById(id);

        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.payment_status = paymentStatus;

        if (paymentData) {

            booking.payment_data = {
                ...(booking.payment_data || {}),
                ...paymentData,
            };
        }

        await booking.save();

        return booking;
    }


    /**
     * Update provider booking ID
     */
    async updateProviderBookingId(
        id,
        providerBookingId
    ) {

        const booking = await this.findById(id);

        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.provider_booking_id =
            providerBookingId;

        await booking.save();

        return booking;
    }


    /**
     * Update booking data
     */
    async updateBookingData(
        id,
        bookingData
    ) {

        const booking = await this.findById(id);

        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.booking_data = {
            ...(booking.booking_data || {}),
            ...(bookingData || {}),
        };

        await booking.save();

        return booking;
    }
}

module.exports = new BookingService();