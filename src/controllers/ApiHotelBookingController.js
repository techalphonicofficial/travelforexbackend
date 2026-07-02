class ApiHotelBookingController {
    constructor(hotelBookingRepo, leadRepo = null, pipelineRepo = null) {
        this.hotelBookingRepo = hotelBookingRepo;
        this.leadRepo = leadRepo;
        this.pipelineRepo = pipelineRepo;
    }

    async create(req, res) {
        try {
            const booking = await this.hotelBookingRepo.createFromRequest(req.body, req.user);
            const data = booking.get ? booking.get({ plain: true }) : booking;

            if (this.leadRepo && this.pipelineRepo) {
                try {
                    let pipelineId = null;
                    let stageId = null;
                    const activePipelines = await this.pipelineRepo.findActive();
                    if (activePipelines && activePipelines.length) {
                        const targetPipeline = activePipelines.find(p =>
                            p.name.toLowerCase().includes('hotel') ||
                            p.name.toLowerCase().includes('booking')
                        ) || activePipelines[0];
                        pipelineId = targetPipeline.id;
                        stageId = targetPipeline.stages && targetPipeline.stages[0] ? targetPipeline.stages[0].id : null;
                    }

                    await this.leadRepo.create({
                        name: data.raw_payload && data.raw_payload.user_id ? 'Hotel Booking Request' : 'Unknown',
                        email: null,
                        phone: data.raw_payload ? data.raw_payload.phone : null,
                        source: 'hotel_booking',
                        pipeline_id: pipelineId,
                        stage_id: stageId,
                        customer_id: data.user_id,
                        custom_fields: {
                            hotel_booking_id: data.id,
                            hotel_id: data.hotel_id,
                            hotel_name: data.raw_payload ? data.raw_payload.hotel_name : null,
                            room_count: data.room_count,
                            commission_percent: data.commission_percent
                        },
                        notes: 'Hotel booking request created from website.'
                    });
                } catch (leadErr) {
                    console.error('Error creating Lead for hotel booking:', leadErr);
                }
            }

            try {
                const { Notification } = require('../container').models;
                if (Notification) {
                    await Notification.create({
                        title: 'New Hotel Booking',
                        message: `A new hotel booking has been made. Hotel ID: ${data.hotel_id}`,
                        type: 'new_booking',
                        reference_id: data.id
                    });
                }
            } catch (notifErr) {
                console.error("Error creating Notification for hotel booking:", notifErr);
            }

            return res.status(201).json({
                success: true,
                message: 'Hotel booking submitted successfully',
                data: {
                    hotel_booking_id: data.id,
                    id: data.id,
                    user_id: data.user_id,
                    customer_id: data.customer_id,
                    hotel_id: data.hotel_id,
                    room_count: data.room_count,
                    rooms: data.rooms,
                    base_amount: data.base_amount,
                    commission_percent: data.commission_percent,
                    commission_amount: data.commission_amount,
                    total_amount: data.total_amount,
                    status: data.status,
                    created_at: data.created_at
                }
            });
        } catch (error) {
            const status = error.statusCode || 500;
            if (status >= 500) console.error('HotelBooking create error:', error);
            return res.status(status).json({ success: false, message: error.message });
        }
    }
}

module.exports = ApiHotelBookingController;
