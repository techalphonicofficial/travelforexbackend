class ApiTripInquiryController {
    constructor(tripInquiryRepo, leadRepo, pipelineRepo) {
        this.tripInquiryRepo = tripInquiryRepo;
        this.leadRepo = leadRepo;
        this.pipelineRepo = pipelineRepo;
    }

    /**
     * POST /api/v1/trip-inquiries
     * Accepts frontend customize-flow payload, calculates taxes, stores inquiry
     */
    async create(req, res) {
        try {
            const { customer = {}, trip = {}, source = 'customize_flow' } = req.body;
            const requestCustomer = customer || {};
            const authCustomer = req.user ? {
                ...requestCustomer,
                id: req.user.id,
                name: req.user.name || requestCustomer.name,
                email: req.user.email || requestCustomer.email
            } : requestCustomer;

            // Validate required fields
            if (!trip.destination) {
                return res.status(400).json({ success: false, message: 'trip.destination is required' });
            }

            const customerId = await this.tripInquiryRepo.resolveCustomerId(authCustomer);

            // ── Lookup destination to fetch GST/TCS rates ──────────────────
            let gstRate      = 5.00;   // Indian domestic default
            let gstFlatAmount = 0.00;
            let tcsRate      = 0.00;
            let taxRuleType  = 'domestic';
            let destinationId = null;

            if (trip.destination_slug) {
                const destRecord = await this.tripInquiryRepo.findDestinationBySlug(trip.destination_slug);
                if (destRecord) {
                    gstRate      = parseFloat(destRecord.gst_rate)  || 5.00;
                    gstFlatAmount = parseFloat(destRecord.gst_amount) || 0.00;
                    tcsRate      = 0.00; // TCS removed
                    taxRuleType  = destRecord.tax_rule_type          || 'domestic';
                    destinationId = destRecord.id;
                }
            }

            let enrichedCities = [];
            if (trip.cities && Array.isArray(trip.cities)) {
                for (const city of trip.cities) {
                    let enrichedCity = { ...city };
                    if (city.id) {
                        const dest = await this.tripInquiryRepo.findDestinationById(city.id);
                        if (dest && dest.activities_data) {
                            enrichedCity.activities = dest.activities_data;
                        } else {
                            enrichedCity.activities = [];
                        }
                    } else {
                        enrichedCity.activities = [];
                    }
                    enrichedCities.push(enrichedCity);
                }
            } else {
                enrichedCities = trip.cities || [];
            }

            // ── Build record ────────────────────────────────────────────────
            const inquiryData = {
                // Customer snapshot
                customer_id:    customerId,
                customer_name:  authCustomer.name  || null,
                customer_email: authCustomer.email || null,
                customer_phone: authCustomer.phone || null,

                // Trip details
                destination:      trip.destination,
                destination_slug: trip.destination_slug     || null,
                destination_id:   destinationId,
                travel_with:      trip.travel_with          || null,
                duration:         trip.duration             || null,
                departure_city:   trip.departure_city       || null,
                departure_date:   trip.departure_date       || null,
                total_travellers: trip.total_travellers     || 1,
                rooms:            trip.rooms                || [],
                cities:           enrichedCities,

                // Tax info from destination
                tax_rule_type: taxRuleType,
                gst_rate:      gstRate,
                tcs_rate:      tcsRate,

                // Price will be set by agent later; default zeros
                base_price:   0,
                gst_amount:   0,
                tcs_amount:   0,
                total_amount: 0,

                source,
                raw_payload: req.body,
                status: 'new'
            };

            const inquiry = await this.tripInquiryRepo.create(inquiryData);

            // Create a CRM Lead as requested
            if (this.leadRepo && this.pipelineRepo) {
                try {
                    let pipelineId = null;
                    let stageId = null;
                    const activePipelines = await this.pipelineRepo.findActive();
                    if (activePipelines && activePipelines.length > 0) {
                        // Prefer a pipeline specifically named for custom bookings
                        let targetPipeline = activePipelines.find(p => 
                            p.name.toLowerCase().includes('custom booking') || 
                            p.name.toLowerCase().includes('custom trip')
                        );
                        
                        // Fallback to the first active pipeline
                        if (!targetPipeline) {
                            targetPipeline = activePipelines[0];
                        }

                        pipelineId = targetPipeline.id;
                        if (targetPipeline.stages && targetPipeline.stages.length > 0) {
                            stageId = targetPipeline.stages[0].id;
                        }
                    }

                    await this.leadRepo.create({
                        name: authCustomer.name || 'Unknown',
                        email: authCustomer.email || null,
                        phone: authCustomer.phone || null,
                        source: source,
                        pipeline_id: pipelineId,
                        stage_id: stageId,
                        customer_id: customerId,
                        custom_fields: {
                            destination: trip.destination,
                            travel_with: trip.travel_with,
                            duration: trip.duration,
                            departure_city: trip.departure_city,
                            departure_date: trip.departure_date,
                            total_travellers: trip.total_travellers,
                            custom_booking_id: inquiry.id
                        },
                        notes: 'Custom booking request created from website.'
                    });
                } catch (leadErr) {
                    console.error("Error creating Lead for custom booking:", leadErr);
                    // Do not fail the booking if lead creation fails
                }
            }
            
            // Create a Notification for the new enquiry
            try {
                const { Notification } = require('../container').models;
                if (Notification) {
                    await Notification.create({
                        title: 'New Enquiry Received',
                        message: `A new enquiry has been submitted by ${authCustomer.name || 'Unknown'} for destination: ${trip.destination}. Source: ${source}`,
                        type: 'new_enquiry',
                        reference_id: inquiry.id
                    });
                }
            } catch (notifErr) {
                console.error("Error creating Notification:", notifErr);
            }

            return res.status(201).json({
                success: true,
                message: 'Custom booking request submitted successfully',
                data: {
                    custom_booking_id: inquiry.id,
                    id:             inquiry.id,
                    status:         inquiry.status,
                    destination:    inquiry.destination,
                    tax_rule_type:  inquiry.tax_rule_type,
                    gst_rate:       inquiry.gst_rate,
                    tcs_rate:       0.00,
                    created_at:     inquiry.created_at,
                    tax_info: {
                        rule:     taxRuleType,
                        gst_rate: gstFlatAmount > 0 ? `Flat ₹${gstFlatAmount}` : `${gstRate}%`,
                        tcs_rate: `0%`,
                        note:     'Actual amount will be calculated once agent assigns base price'
                    }
                }
            });

        } catch (error) {
            console.error('TripInquiry create error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/trip-inquiries
     * Admin: paginated list with optional search & status filter
     */
    async list(req, res) {
        try {
            const page   = parseInt(req.query.page)   || 1;
            const limit  = parseInt(req.query.limit)  || 20;
            const search = req.query.search            || '';
            const status = req.query.status            || '';

            const result = await this.tripInquiryRepo.findPaginated(page, limit, search, status);

            return res.json({
                success: true,
                data: {
                    total:        result.count,
                    page,
                    limit,
                    total_pages:  Math.ceil(result.count / limit),
                    rows:         result.rows
                }
            });
        } catch (error) {
            console.error('TripInquiry list error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async listForAuthenticatedUser(req, res) {
        try {
            const userId = req.user && req.user.id ? String(req.user.id).trim() : '';
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authenticated user id is required' });
            }

            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
            const status = String(req.query.status || '').trim();
            const Op = this.tripInquiryRepo.TripInquiry.sequelize.Sequelize.Op;
            const models = this.tripInquiryRepo.TripInquiry.sequelize.models || {};
            const Customer = models.Customer;
            const CustomTrip = models.CustomTrip;
            const Destination = models.Destination;
            const Payment = models.Payment;

            const customers = Customer
                ? await Customer.findAll({ where: { user_id: userId }, attributes: ['id'] })
                : [];
            const customerIds = customers.map(customer => customer.id);
            const identityConditions = [];

            if (customerIds.length) {
                identityConditions.push({ customer_id: { [Op.in]: customerIds } });
            }
            if (req.user.email) {
                identityConditions.push({ customer_email: req.user.email });
            }

            if (!identityConditions.length) {
                return res.json({
                    success: true,
                    data: {
                        user_id: userId,
                        customer_ids: [],
                        total: 0,
                        page,
                        limit,
                        total_pages: 0,
                        customize_requests: [],
                        custom_trips: [],
                        rows: []
                    }
                });
            }

            const inquiryWhere = {
                [Op.and]: [
                    { [Op.or]: identityConditions },
                    { [Op.or]: [{ source: { [Op.ne]: 'hotel_booking' } }, { source: null }] }
                ]
            };
            if (status) inquiryWhere.status = status;

            const inquiryResult = await this.tripInquiryRepo.TripInquiry.findAndCountAll({
                where: inquiryWhere,
                include: Destination ? [{ model: Destination, as: 'destination_info', required: false }] : [],
                limit,
                offset: (page - 1) * limit,
                order: [['created_at', 'DESC']]
            });

            const customTripWhere = customerIds.length ? { customer_id: { [Op.in]: customerIds } } : null;
            const customTrips = customTripWhere && CustomTrip
                ? await CustomTrip.findAll({
                    where: customTripWhere,
                    include: [
                        Destination ? { model: Destination, as: 'destination', required: false } : null,
                        Payment ? { model: Payment, as: 'payments', required: false } : null
                    ].filter(Boolean),
                    order: [['created_at', 'DESC']]
                })
                : [];

            const customizeRequests = inquiryResult.rows.map(row => {
                const inquiry = row.get ? row.get({ plain: true }) : row;
                return {
                    type: 'customize_request',
                    id: inquiry.id,
                    custom_booking_id: inquiry.id,
                    status: inquiry.status,
                    destination: inquiry.destination,
                    destination_slug: inquiry.destination_slug,
                    destination_id: inquiry.destination_id,
                    travel_with: inquiry.travel_with,
                    duration: inquiry.duration,
                    departure_city: inquiry.departure_city,
                    departure_date: inquiry.departure_date,
                    total_travellers: inquiry.total_travellers,
                    rooms: inquiry.rooms || [],
                    cities: inquiry.cities || [],
                    base_price: inquiry.base_price,
                    gst_amount: inquiry.gst_amount,
                    total_amount: inquiry.total_amount,
                    source: inquiry.source,
                    created_at: inquiry.created_at,
                    updated_at: inquiry.updated_at
                };
            });

            const convertedTrips = customTrips.map(row => {
                const trip = row.get ? row.get({ plain: true }) : row;
                const payments = trip.payments || [];
                const hasSuccessPayment = payments.some(payment => payment.status === 'success');
                return {
                    type: 'custom_trip',
                    id: trip.id,
                    custom_trip_id: trip.id,
                    booking_reference: `PT-BKB${String(trip.id).padStart(5, '0')}`,
                    status: trip.status,
                    destination_id: trip.destination_id,
                    destination: trip.destination ? trip.destination.name : null,
                    start_date: trip.start_date,
                    end_date: trip.end_date,
                    base_price: trip.base_price,
                    total_tax: trip.total_tax,
                    total_price: trip.total_price,
                    payment_status: hasSuccessPayment ? 'paid' : 'pending',
                    created_at: trip.created_at,
                    updated_at: trip.updated_at
                };
            });

            const rows = [...customizeRequests, ...convertedTrips]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            return res.json({
                success: true,
                data: {
                    user_id: userId,
                    customer_ids: customerIds,
                    total: inquiryResult.count + convertedTrips.length,
                    page,
                    limit,
                    total_pages: Math.ceil(inquiryResult.count / limit),
                    customize_requests: customizeRequests,
                    custom_trips: convertedTrips,
                    rows
                }
            });
        } catch (error) {
            console.error('User customize bookings list error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/trip-inquiries/:id  (admin, API key required)
     */
    async getById(req, res) {
        try {
            const inquiry = await this.tripInquiryRepo.findById(req.params.id);
            if (!inquiry) {
                return res.status(404).json({ success: false, message: 'Inquiry not found' });
            }
            return res.json({ success: true, data: inquiry });
        } catch (error) {
            console.error('TripInquiry getById error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/trip-inquiries/inquiries/:id  (public, no auth)
     * Returns full inquiry data + city gallery images keyed by city.id
     */
    async getByIdPublic(req, res) {
        try {
            const inquiry = await this.tripInquiryRepo.findByIdWithGallery(req.params.id);
            if (!inquiry) {
                return res.status(404).json({ success: false, message: 'Inquiry not found' });
            }
            return res.json({
                success: true,
                data: {
                    id:               inquiry.id,
                    status:           inquiry.status,
                    // Customer
                    customer_name:    inquiry.customer_name,
                    customer_email:   inquiry.customer_email,
                    customer_phone:   inquiry.customer_phone,
                    // Trip
                    destination:      inquiry.destination,
                    destination_slug: inquiry.destination_slug,
                    travel_with:      inquiry.travel_with,
                    duration:         inquiry.duration,
                    departure_city:   inquiry.departure_city,
                    departure_date:   inquiry.departure_date,
                    total_travellers: inquiry.total_travellers,
                    rooms:            inquiry.rooms,
                    // Pricing
                    base_price:       inquiry.base_price,
                    gst_rate:         inquiry.gst_rate,
                    gst_amount:       inquiry.gst_amount,
                    tcs_rate:         0.00,
                    tcs_amount:       0.00,
                    total_amount:     inquiry.total_amount,
                    // Cities with gallery
                    cities:           inquiry.cities || [],
                    // Destination feature image
                    destination_gallery: inquiry.destination_gallery || [],
                    // Notes / source
                    source:           inquiry.source,
                    notes:            inquiry.notes,
                    created_at:       inquiry.created_at,
                    updated_at:       inquiry.updated_at
                }
            });
        } catch (error) {
            console.error('TripInquiry getByIdPublic error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PATCH /api/v1/trip-inquiries/:id/status
     * Update inquiry status
     */
    async updateStatus(req, res) {
        try {
            const { status, notes } = req.body;
            const allowed = ['new', 'contacted', 'quoted', 'converted', 'cancelled'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
            }
            const inquiry = await this.tripInquiryRepo.updateStatus(req.params.id, status, notes);
            if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
            return res.json({ success: true, data: inquiry });
        } catch (error) {
            console.error('TripInquiry updateStatus error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * PATCH /api/v1/trip-inquiries/:id/price
     * Agent sets base price → GST + TCS auto-calculated
     */
    async setPrice(req, res) {
        try {
            const { base_price } = req.body;
            if (!base_price || isNaN(base_price)) {
                return res.status(400).json({ success: false, message: 'base_price is required and must be a number' });
            }
            const inquiry = await this.tripInquiryRepo.setPrice(req.params.id, base_price);
            if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

            return res.json({
                success: true,
                message: 'Price and tax calculated successfully',
                data: {
                    id:           inquiry.id,
                    base_price:   inquiry.base_price,
                    gst_rate:     inquiry.gst_rate,
                    tcs_rate:     0.00,
                    gst_amount:   inquiry.gst_amount,
                    tcs_amount:   0.00,
                    total_amount: inquiry.total_amount,
                    tax_breakdown: {
                        base:       parseFloat(inquiry.base_price),
                        gst:        (inquiry.destination_info && parseFloat(inquiry.destination_info.gst_amount) > 0)
                                      ? `Flat = ₹${inquiry.gst_amount}`
                                      : `${inquiry.gst_rate}% = ₹${inquiry.gst_amount}`,
                        tcs:        `0% = ₹0.00`,
                        total:      parseFloat(inquiry.total_amount)
                    }
                }
            });
        } catch (error) {
            console.error('TripInquiry setPrice error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ApiTripInquiryController;
