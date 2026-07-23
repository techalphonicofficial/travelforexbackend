class AdminTripBuilderController {
    constructor(tripBuilderService, hotelRepo, activityRepo, bookingRepo, accountingService, appSettingRepo = null, couponService = null) {
        this.tripBuilderService = tripBuilderService;
        this.hotelRepo = hotelRepo;
        this.activityRepo = activityRepo;
        this.bookingRepo = bookingRepo;
        this.accountingService = accountingService;
        this.appSettingRepo = appSettingRepo;
        this.couponService = couponService;
    }

    async initTrip(req, res) {
        try {
            const { customer_name, customer_email, customer_phone, destination_ids, package_id, start_date, end_date, inquiry_id } = req.body;
            if (!customer_name || !customer_email || !start_date || !end_date) {
                return res.status(400).json({ success: false, message: 'Missing fields' });
            }
            
            // Auto-create or fetch customer
            const User = this.tripBuilderService.customTripRepo.CustomTrip.sequelize.models.User;
            const Customer = this.tripBuilderService.customTripRepo.CustomTrip.sequelize.models.Customer;
            
            let user = await User.findOne({ where: { email: customer_email } });
            let customer_id = null;

            if (user) {
                const customer = await Customer.findOne({ where: { user_id: user.id } });
                if (customer) {
                    customer_id = customer.id;
                } else {
                    const newCustomer = await Customer.create({ user_id: user.id });
                    customer_id = newCustomer.id;
                }
            } else {
                // Create user and customer
                const bcrypt = require('bcryptjs');
                const password = await bcrypt.hash('Techalphonic@123', 10);
                user = await User.create({
                    name: customer_name,
                    email: customer_email,
                    phone_number: customer_phone,
                    password: password,
                    type: 'customer'
                });
                const newCustomer = await Customer.create({ user_id: user.id });
                customer_id = newCustomer.id;
            }

            let trip;
            if (package_id) {
                trip = await this.tripBuilderService.clonePackageIntoTrip(customer_id, package_id, start_date);
            } else {
                if (!destination_ids || destination_ids.length === 0) {
                    return res.status(400).json({ success: false, message: 'Missing destination_ids' });
                }
                const primary_dest_id = destination_ids[0];
                trip = await this.tripBuilderService.initializeTrip(customer_id, primary_dest_id, start_date, end_date);
            }

            // If inquiry_id is provided, copy itinerary details from inquiry
            if (inquiry_id) {
                const TripInquiry = this.tripBuilderService.customTripRepo.CustomTrip.sequelize.models.TripInquiry;
                const CustomTripDay = this.tripBuilderService.customTripRepo.CustomTripDay;
                const CustomTripActivity = this.tripBuilderService.customTripRepo.CustomTripActivity;

                const inquiry = await TripInquiry.findByPk(inquiry_id);
                if (inquiry) {
                    let usedInquiryPrice = false;

                    if (!package_id) {
                        // Delete default empty day rows
                        await CustomTripDay.destroy({ where: { custom_trip_id: trip.id } });

                        // Populate CustomTripDays and CustomTripActivities by copying inquiry's day-wise cities and activities
                        if (inquiry.cities && Array.isArray(inquiry.cities)) {
                        let dayGlobalIndex = 1;
                        for (const city of inquiry.cities) {
                            if (city.activities && Array.isArray(city.activities)) {
                                for (const dayObj of city.activities) {
                                    const tripDay = await CustomTripDay.create({
                                        custom_trip_id: trip.id,
                                        day_number: dayGlobalIndex++,
                                        destination_id: city.id || null,
                                        title: city.name,
                                        description: dayObj.description || null
                                    });

                                    if (dayObj.activities && Array.isArray(dayObj.activities)) {
                                        for (const act of dayObj.activities) {
                                            await CustomTripActivity.create({
                                                custom_trip_day_id: tripDay.id,
                                                title: act.time ? `${act.time} - ${act.description}` : act.description,
                                                description: act.location ? `Location: ${act.location}` : null
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        }
                    }

                    // Set base/total prices if inquiry already has them
                    if (parseFloat(inquiry.base_price) > 0 || parseFloat(inquiry.total_amount) > 0) {
                        await trip.update({
                            base_price: parseFloat(inquiry.base_price) || 0.00,
                            total_tax: parseFloat(inquiry.gst_amount) || 0.00,
                            total_price: parseFloat(inquiry.total_amount) || 0.00,
                            tax_breakdown: { GST: parseFloat(inquiry.gst_amount) || 0.00 }
                        });
                        usedInquiryPrice = true;
                    }

                    // Recalculate only when the inquiry has no quoted amount yet.
                    if (!usedInquiryPrice && !package_id) {
                        await this.tripBuilderService.recalculateTripPrice(trip.id);
                    }
                }
            }
            
            const enrichedTrip = await this.tripBuilderService.getTripDetails(trip.id);
            res.json({ success: true, data: enrichedTrip });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async updateDayDestination(req, res) {
        try {
            const { dayId } = req.params;
            const { destination_id } = req.body;
            const day = await this.tripBuilderService.customTripRepo.CustomTripDay.findByPk(dayId);
            if (day) {
                await day.update({ destination_id });
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Day not found' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async getHotels(req, res) {
        try {
            const destination_id = req.params.destinationId;
            const hotels = await this.hotelRepo.Hotel.findAll({ where: { destination_id } });
            res.json({ success: true, data: hotels });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async getActivities(req, res) {
        try {
            const destination_id = req.params.destinationId;
            const activities = await this.activityRepo.Activity.findAll({ where: { destination_id } });
            res.json({ success: true, data: activities });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async setHotel(req, res) {
        try {
            const { tripId, dayNumber } = req.params;
            const { hotel_id } = req.body;
            const trip = await this.tripBuilderService.setHotelForDay(tripId, dayNumber, hotel_id);
            res.json({ success: true, data: trip });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async updateDayDescription(req, res) {
        try {
            const { dayId } = req.params;
            const { description } = req.body;
            // dayId is the actual PK of custom_trip_days
            const day = await this.tripBuilderService.customTripRepo.CustomTripDay.findByPk(dayId);
            if (day) {
                await day.update({ description });
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Day not found' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async addActivity(req, res) {
        try {
            const { tripId, dayNumber } = req.params;
            const { activity_id } = req.body;
            const trip = await this.tripBuilderService.addActivityToDay(tripId, dayNumber, activity_id);
            res.json({ success: true, data: trip });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async removeActivity(req, res) {
        try {
            const { tripId, dayNumber, activityId } = req.params;
            const trip = await this.tripBuilderService.removeActivityFromDay(tripId, dayNumber, activityId);
            res.json({ success: true, data: trip });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    }

    money(value) {
        const amount = Number(value);
        return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
    }

    slugify(value) {
        const slug = String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return slug || `custom-package-${Date.now().toString(36)}`;
    }

    packageBookingReference(tripId) {
        return `PT-PKG-CUST-${String(tripId || 'NA').padStart(5, '0')}`;
    }

    adminPackageBookingReference(packageId) {
        const stamp = Date.now().toString(36).toUpperCase();
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        return `PT-PKG-ADMIN-${String(packageId || 'NA').padStart(4, '0')}-${stamp}${suffix}`;
    }

    normalizeAdults(value) {
        const adults = parseInt(value, 10);
        return Number.isInteger(adults) && adults > 0 ? adults : 1;
    }

    boolSetting(value) {
        return ['true', '1', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
    }

    normalizePaymentMode(value) {
        return String(value || '').trim().toLowerCase() === 'full' ? 'full' : 'partial';
    }

    async getPartialBookingConfig() {
        if (!this.appSettingRepo) {
            return { enabled: false, percentage: 0 };
        }

        const [enabledValue, percentageValue] = await Promise.all([
            this.appSettingRepo.get('crm_partial_booking_enabled'),
            this.appSettingRepo.get('crm_partial_booking_percentage')
        ]);
        const enabled = this.boolSetting(enabledValue);
        const percentage = Math.min(Math.max(this.money(percentageValue), 0), 100);

        return {
            enabled,
            percentage: enabled ? percentage : 0
        };
    }

    async findPackageForBooking(packageId, transaction = null) {
        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const Package = this.bookingRepo.Package;
        if (!Package) return null;

        const include = [
            sequelize.models.PackageDestination && sequelize.models.Destination ? {
                model: sequelize.models.PackageDestination,
                as: 'destinations',
                required: false,
                include: [{ model: sequelize.models.Destination, as: 'destination', required: false }]
            } : null,
            sequelize.models.PackageInclusion ? { model: sequelize.models.PackageInclusion, as: 'inclusions', required: false } : null,
            sequelize.models.PackageExclusion ? { model: sequelize.models.PackageExclusion, as: 'exclusions', required: false } : null,
            sequelize.models.PackageHighlight ? { model: sequelize.models.PackageHighlight, as: 'highlights', required: false } : null,
            sequelize.models.User ? { model: sequelize.models.User, as: 'vendor', required: false, attributes: ['id', 'name', 'email'] } : null
        ].filter(Boolean);

        return Package.findByPk(packageId, { include, transaction });
    }

    packageRoute(packageRow) {
        const destinations = Array.isArray(packageRow.destinations) ? packageRow.destinations : [];
        return destinations
            .slice()
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
            .map(item => item.destination ? item.destination.name : null)
            .filter(Boolean);
    }

    packageHotels(packageRow) {
        const destinations = Array.isArray(packageRow.destinations) ? packageRow.destinations : [];
        const hotels = [];

        destinations
            .slice()
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
            .forEach(destinationRow => {
                const activities = destinationRow.activities || {};
                const hotelRows = Array.isArray(activities._hotels)
                    ? activities._hotels
                    : (Array.isArray(activities.hotels) ? activities.hotels : []);

                hotelRows.forEach((hotel, index) => {
                    const pricePerNight = this.money(hotel.pricePerNight || hotel.price_per_night || 0);
                    const nights = Math.max(parseInt(hotel.nights, 10) || Number(destinationRow.nights || 0) || 1, 1);
                    const rooms = Math.max(parseInt(hotel.rooms, 10) || 1, 1);
                    const estimatedAmount = this.money(pricePerNight * nights * rooms);

                    hotels.push({
                        id: hotel.hotelId || hotel.hotel_id || hotel.hotel || hotel.id || `${destinationRow.id || 'dest'}-${index}`,
                        name: hotel.name || 'Hotel',
                        destination_id: destinationRow.destination_id || null,
                        destination_name: destinationRow.destination ? destinationRow.destination.name : null,
                        star_rating: parseInt(hotel.starRating || hotel.star_rating, 10) || 0,
                        guest_rating: Number(hotel.guestRating || hotel.guest_rating || 0),
                        price_per_night: pricePerNight,
                        nights,
                        rooms,
                        estimated_amount: estimatedAmount,
                        image: hotel.image || hotel.image_url || ''
                    });
                });
            });

        const uniqueHotels = new Map();
        hotels.forEach(hotel => {
            const key = [hotel.destination_id, String(hotel.name || '').trim().toLowerCase(), hotel.nights, hotel.rooms, hotel.price_per_night].join('|');
            if (!uniqueHotels.has(key)) uniqueHotels.set(key, hotel);
        });
        return [...uniqueHotels.values()];
    }

    calculatePackageQuote(packageRow, adults, partialConfig, paymentMode = 'partial') {
        const adultCount = this.normalizeAdults(adults);
        const normalizedPaymentMode = this.normalizePaymentMode(paymentMode);
        const hotels = this.packageHotels(packageRow);
        const hotelEstimatedAmount = this.money(hotels.reduce((sum, hotel) => sum + Number(hotel.estimated_amount || 0), 0));
        const basePerAdult = this.money(packageRow.price || 0);
        const discountPercentage = Math.min(Math.max(this.money(packageRow.discount_percentage || 0), 0), 100);
        const grossBaseAmount = this.money(basePerAdult * adultCount);
        const discountAmount = this.money(grossBaseAmount * discountPercentage / 100);
        const baseAmount = this.money(Math.max(grossBaseAmount - discountAmount, 0));
        const taxPercent = this.money(packageRow.tax_percent || 0);
        const taxAmount = this.money(baseAmount * taxPercent / 100);
        const packageTotal = this.money(baseAmount + taxAmount);
        const partialEnabled = Boolean(normalizedPaymentMode === 'partial' && partialConfig.enabled && partialConfig.percentage > 0);
        const payableNow = partialEnabled
            ? this.money(packageTotal * partialConfig.percentage / 100)
            : packageTotal;
        const remainingAmount = this.money(Math.max(packageTotal - payableNow, 0));
        const vendorAmount = packageRow.vendor_id
            ? this.money(Math.min(hotelEstimatedAmount > 0 ? hotelEstimatedAmount : baseAmount, baseAmount))
            : 0;
        const platformAmount = this.money(Math.max(baseAmount - vendorAmount, 0));

        return {
            paymentMode: partialEnabled ? 'partial' : 'full',
            adultCount,
            hotels,
            hotelEstimatedAmount,
            basePerAdult,
            grossBaseAmount,
            discountPercentage,
            discountAmount,
            baseAmount,
            taxType: packageRow.tax_type || null,
            taxPercent,
            taxAmount,
            packageTotal,
            payableNow,
            remainingAmount,
            remainingPercentage: packageTotal > 0 ? this.money((remainingAmount / packageTotal) * 100) : 0,
            partialBookingEnabled: partialEnabled,
            partialBookingPercentage: partialEnabled ? this.money(partialConfig.percentage) : 0,
            vendorAmount,
            platformAmount,
            vendorSplitBasis: packageRow.vendor_id
                ? (hotelEstimatedAmount > 0 ? 'hotel_estimated_amount' : 'package_base_amount')
                : 'no_vendor'
        };
    }

    applyAdminPackageAmounts(quote, baseBookingAmount, paidAmount, gstPercent = 0, hotelAmount = 0) {
        const systemCalculatedTotal = quote.packageTotal;
        const serviceBaseAmount = this.money(baseBookingAmount);
        const normalizedHotelAmount = this.money(hotelAmount);
        const baseAmount = this.money(serviceBaseAmount + normalizedHotelAmount);
        const normalizedGstPercent = Math.min(Math.max(this.money(gstPercent), 0), 100);
        const taxAmount = this.money(baseAmount * normalizedGstPercent / 100);
        const packageTotal = this.money(baseAmount + taxAmount);
        const payableNow = this.money(paidAmount);
        const remainingAmount = this.money(Math.max(packageTotal - payableNow, 0));
        const vendorAmount = normalizedHotelAmount;

        return {
            ...quote,
            systemCalculatedTotal,
            serviceBaseAmount,
            hotelAmount: normalizedHotelAmount,
            baseAmount,
            taxPercent: normalizedGstPercent,
            taxType: normalizedGstPercent > 0 ? 'GST' : null,
            taxAmount,
            packageTotal,
            payableNow,
            remainingAmount,
            remainingPercentage: packageTotal > 0 ? this.money((remainingAmount / packageTotal) * 100) : 0,
            paymentMode: remainingAmount > 0 ? 'partial' : 'full',
            partialBookingEnabled: remainingAmount > 0,
            partialBookingPercentage: packageTotal > 0 ? this.money((payableNow / packageTotal) * 100) : 0,
            vendorAmount,
            platformAmount: serviceBaseAmount,
            vendorSplitBasis: normalizedHotelAmount > 0 ? 'manual_hotel_amount' : 'package_base_amount'
        };
    }

    serializePackageQuote(packageRow, quote) {
        const destinations = Array.isArray(packageRow.destinations) ? packageRow.destinations : [];
        const inclusions = Array.isArray(packageRow.inclusions) ? packageRow.inclusions : [];
        const exclusions = Array.isArray(packageRow.exclusions) ? packageRow.exclusions : [];
        const highlights = Array.isArray(packageRow.highlights) ? packageRow.highlights : [];

        return {
            package: {
                id: packageRow.id,
                name: packageRow.name,
                slug: packageRow.slug,
                duration_days: packageRow.duration_days,
                price: Number(packageRow.price || 0),
                discount_percentage: Number(packageRow.discount_percentage || 0),
                tax_type: packageRow.tax_type,
                tax_percent: Number(packageRow.tax_percent || 0),
                description: packageRow.description,
                main_image: packageRow.main_image,
                vendor_id: packageRow.vendor_id,
                vendor: packageRow.vendor ? {
                    id: packageRow.vendor.id,
                    name: packageRow.vendor.name,
                    email: packageRow.vendor.email
                } : null
            },
            route: this.packageRoute(packageRow),
            destinations: destinations
                .slice()
                .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                .map(item => ({
                    id: item.destination_id,
                    name: item.destination ? item.destination.name : null,
                    nights: Number(item.nights || 0)
                })),
            inclusions: inclusions.map(item => item.text).filter(Boolean),
            exclusions: exclusions.map(item => item.text).filter(Boolean),
            highlights: highlights
                .slice()
                .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
                .map(item => item.content)
                .filter(Boolean),
            amounts: {
                payment_mode: quote.paymentMode,
                adults: quote.adultCount,
                base_per_adult: quote.basePerAdult,
                gross_base_amount: quote.grossBaseAmount,
                hotel_estimated_amount: quote.hotelEstimatedAmount,
                hotel_count: quote.hotels.length,
                discount_percentage: quote.discountPercentage,
                discount_amount: quote.discountAmount,
                package_base_amount: quote.baseAmount,
                tax_type: quote.taxType,
                tax_percent: quote.taxPercent,
                tax_amount: quote.taxAmount,
                package_total: quote.packageTotal,
                payable_now: quote.payableNow,
                paid_amount: quote.payableNow,
                remaining_amount: quote.remainingAmount,
                remaining_percentage: quote.remainingPercentage
            },
            partial_booking: {
                enabled: quote.partialBookingEnabled,
                percentage: quote.partialBookingPercentage
            },
            hotels: quote.hotels,
            split: {
                vendor_amount: quote.vendorAmount,
                platform_amount: quote.platformAmount,
                basis: quote.vendorSplitBasis,
                vendor_id: packageRow.vendor_id || null
            }
        };
    }

    async getPackageQuote(req, res) {
        try {
            const packageId = parseInt(req.params.packageId, 10);
            if (!Number.isInteger(packageId) || packageId <= 0) {
                return res.status(400).json({ success: false, message: 'Valid package is required.' });
            }

            const packageRow = await this.findPackageForBooking(packageId);
            if (!packageRow) {
                return res.status(404).json({ success: false, message: 'Package not found.' });
            }

            const partialConfig = await this.getPartialBookingConfig();
            const quote = this.calculatePackageQuote(packageRow, req.query.adults, partialConfig, req.query.payment_mode);

            res.json({ success: true, data: this.serializePackageQuote(packageRow, quote) });
        } catch (e) {
            console.error(e);
            res.status(500).json({ success: false, message: e.message });
        }
    }

    async validatePackageCoupon(req, res) {
        try {
            if (!this.couponService) {
                return res.status(500).json({ success: false, message: 'Coupons are not configured.' });
            }

            const { coupon_code, package_id, customer_id, base_amount } = req.body || {};
            const packageId = parseInt(package_id, 10);
            const baseAmount = Number(base_amount);
            if (!coupon_code || !String(coupon_code).trim()) {
                return res.status(400).json({ success: false, message: 'Enter a coupon code.' });
            }
            if (!Number.isInteger(packageId) || packageId <= 0) {
                return res.status(400).json({ success: false, message: 'Select a package first.' });
            }
            if (!customer_id) {
                return res.status(400).json({ success: false, message: 'Select a customer first.' });
            }
            if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
                return res.status(400).json({ success: false, message: 'Enter a valid base booking amount.' });
            }

            const sequelize = this.bookingRepo.CustomTrip.sequelize;
            const Customer = this.bookingRepo.Customer;
            const User = sequelize.models.User;
            const customer = await Customer.findByPk(customer_id, {
                include: User ? [{ model: User, as: 'user', required: false }] : []
            });
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found.' });
            }

            const preview = await this.couponService.validate({
                code: coupon_code,
                packageId,
                customerId: customer.id,
                customerEmail: customer.user ? customer.user.email : null,
                bookingAmount: baseAmount
            });

            return res.json({
                success: true,
                message: 'Coupon applied successfully.',
                data: {
                    coupon: this.couponService.serializeCoupon(preview.coupon),
                    booking_amount: preview.booking_amount,
                    discount_amount: preview.discount_amount,
                    amount_after_discount: preview.amount_after_discount
                }
            });
        } catch (e) {
            return res.status(e.statusCode || 400).json({ success: false, message: e.message });
        }
    }

    async createPackageBooking(req, res) {
        let transaction = null;

        try {
            const { customer_id, package_id, adults, inquiry_id, payment_mode, passengers, booking_amount, base_amount, hotel_amount, paid_amount, apply_gst, gst_percent, from_date, to_date, departure_date, coupon_code } = req.body || {};
            if (!customer_id) {
                return res.status(400).json({ success: false, message: 'Please select a customer.' });
            }
            const packageId = parseInt(package_id, 10);
            if (!Number.isInteger(packageId) || packageId <= 0) {
                return res.status(400).json({ success: false, message: 'Please select a package.' });
            }
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (![from_date, to_date, departure_date].every(value => datePattern.test(String(value || '')))) {
                return res.status(400).json({ success: false, message: 'From date, to date and departure date are required.' });
            }
            if (to_date < from_date) {
                return res.status(400).json({ success: false, message: 'To date cannot be before from date.' });
            }
            if (departure_date > to_date) {
                return res.status(400).json({ success: false, message: 'Departure date cannot be after the trip end date.' });
            }

            const sequelize = this.bookingRepo.CustomTrip.sequelize;
            const PackageBooking = sequelize.models.PackageBooking;
            const BookingPassenger = sequelize.models.BookingPassenger;
            const Customer = this.bookingRepo.Customer;
            const User = sequelize.models.User;
            if (!PackageBooking || !Customer) {
                return res.status(500).json({ success: false, message: 'Package booking models are not configured.' });
            }

            transaction = await sequelize.transaction();

            const customer = await Customer.findByPk(customer_id, {
                include: User ? [{ model: User, as: 'user', required: false }] : [],
                transaction
            });
            if (!customer) {
                await transaction.rollback();
                transaction = null;
                return res.status(404).json({ success: false, message: 'Customer not found. Add the customer first, then create the booking.' });
            }

            const packageRow = await this.findPackageForBooking(packageId, transaction);
            if (!packageRow) {
                await transaction.rollback();
                transaction = null;
                return res.status(404).json({ success: false, message: 'Package not found.' });
            }

            const partialConfig = await this.getPartialBookingConfig();
            const calculatedQuote = this.calculatePackageQuote(packageRow, adults, partialConfig, payment_mode);
            const hasBaseAmount = base_amount !== undefined && base_amount !== null && base_amount !== '';
            const requestedGstPercent = apply_gst === true || apply_gst === 'true' || apply_gst === 1 || apply_gst === '1'
                ? Number(gst_percent)
                : 0;
            const requestedBaseAmount = hasBaseAmount
                ? Number(base_amount)
                : (booking_amount === undefined || booking_amount === null || booking_amount === ''
                    ? calculatedQuote.baseAmount
                    : Number(booking_amount) / (1 + calculatedQuote.taxPercent / 100));
            const requestedHotelAmount = hotel_amount === undefined || hotel_amount === null || hotel_amount === ''
                ? calculatedQuote.hotelEstimatedAmount
                : Number(hotel_amount);
            const requestedPaidAmount = paid_amount === undefined || paid_amount === null || paid_amount === ''
                ? calculatedQuote.payableNow
                : Number(paid_amount);
            if (!Number.isFinite(requestedBaseAmount) || requestedBaseAmount <= 0) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ success: false, message: 'Base booking amount must be greater than zero.' });
            }
            if (!Number.isFinite(requestedHotelAmount) || requestedHotelAmount < 0) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ success: false, message: 'Hotel amount cannot be negative.' });
            }
            if (!Number.isFinite(requestedGstPercent) || requestedGstPercent < 0 || requestedGstPercent > 100) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ success: false, message: 'GST percentage must be between 0 and 100.' });
            }
            const customerUser = customer.user || {};
            let couponPreview = null;
            if (coupon_code && String(coupon_code).trim()) {
                if (!this.couponService) {
                    await transaction.rollback();
                    transaction = null;
                    return res.status(500).json({ success: false, message: 'Coupons are not configured.' });
                }
                couponPreview = await this.couponService.validate({
                    code: coupon_code,
                    packageId,
                    customerId: customer.id,
                    customerEmail: customerUser.email || null,
                    bookingAmount: requestedBaseAmount,
                    transaction
                });
            }
            const couponDiscountAmount = couponPreview ? this.money(couponPreview.discount_amount) : 0;
            const discountedBaseAmount = this.money(Math.max(requestedBaseAmount - couponDiscountAmount, 0));
            const taxableAmount = discountedBaseAmount + requestedHotelAmount;
            const requestedTotal = this.money(taxableAmount + (taxableAmount * requestedGstPercent / 100));
            if (!Number.isFinite(requestedPaidAmount) || requestedPaidAmount < 0 || requestedPaidAmount > requestedTotal) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ success: false, message: 'Received amount must be between zero and the total booking amount.' });
            }
            const quote = this.applyAdminPackageAmounts(calculatedQuote, discountedBaseAmount, requestedPaidAmount, requestedGstPercent, requestedHotelAmount);
            if (quote.packageTotal <= 0) {
                await transaction.rollback();
                transaction = null;
                return res.status(400).json({ success: false, message: 'Package amount must be greater than zero.' });
            }

            const route = this.packageRoute(packageRow);
            const bookingReference = this.adminPackageBookingReference(packageRow.id);
            const couponSnapshot = couponPreview ? {
                ...this.couponService.serializeCoupon(couponPreview.coupon),
                booking_amount: this.money(requestedBaseAmount),
                discount_amount: couponDiscountAmount,
                amount_after_discount: discountedBaseAmount
            } : {};
            const rawPayload = {
                source: 'admin_package_booking',
                inquiry_id: inquiry_id || null,
                adults: quote.adultCount,
                payment_mode: quote.paymentMode,
                from_date,
                to_date,
                departure_date,
                route,
                hotels: quote.hotels,
                hotel_count: quote.hotels.length,
                hotel_estimated_amount: quote.hotelEstimatedAmount,
                coupon: couponPreview ? couponSnapshot : null,
                package: {
                    id: packageRow.id,
                    name: packageRow.name,
                    slug: packageRow.slug,
                    duration_days: packageRow.duration_days,
                    price: Number(packageRow.price || 0),
                    discount_percentage: Number(packageRow.discount_percentage || 0)
                },
                pricing: {
                    system_calculated_total: quote.systemCalculatedTotal,
                    manually_overridden: this.money(quote.systemCalculatedTotal) !== this.money(quote.packageTotal),
                    service_base_amount: quote.serviceBaseAmount,
                    original_service_base_amount: this.money(requestedBaseAmount),
                    coupon_discount_amount: couponDiscountAmount,
                    hotel_amount: quote.hotelAmount,
                    gross_base_amount: quote.grossBaseAmount,
                    hotel_estimated_amount: quote.hotelEstimatedAmount,
                    discount_amount: quote.discountAmount,
                    package_base_amount: quote.baseAmount,
                    tax_percent: quote.taxPercent,
                    tax_amount: quote.taxAmount,
                    package_total: quote.packageTotal,
                    payable_now: quote.payableNow,
                    paid_amount: quote.payableNow,
                    remaining_amount: quote.remainingAmount,
                    remaining_percentage: quote.remainingPercentage
                },
                partial_booking: {
                    enabled: quote.partialBookingEnabled,
                    percentage: quote.partialBookingPercentage
                },
                created_by: req.session && req.session.user ? req.session.user.id : null
            };

            const booking = await PackageBooking.create({
                booking_reference: bookingReference,
                package_id: packageRow.id,
                package_slug: packageRow.slug || null,
                package_name: packageRow.name || null,
                vendor_id: packageRow.vendor_id || null,
                customer_id: customer.id,
                customer_name: customerUser.name || null,
                customer_email: customerUser.email || null,
                customer_phone: customer.phone || customerUser.phone_number || null,
                from_date,
                to_date,
                departure_date,
                package_base_amount: quote.baseAmount,
                hotel_amount: quote.hotelAmount,
                tax_type: quote.taxType,
                tax_percent: quote.taxPercent,
                tax_amount: quote.taxAmount,
                package_total: quote.packageTotal,
                paid_amount: quote.payableNow,
                remaining_amount: quote.remainingAmount,
                coupon_id: couponPreview ? couponPreview.coupon.id : null,
                coupon_code: couponPreview ? couponPreview.coupon.code : null,
                coupon_discount_amount: couponDiscountAmount,
                coupon_snapshot: couponSnapshot,
                vendor_amount: quote.vendorAmount,
                platform_amount: quote.platformAmount,
                vendor_split_basis: quote.vendorSplitBasis,
                partial_booking_enabled: quote.partialBookingEnabled,
                partial_booking_percentage: quote.partialBookingPercentage,
                payment_status: quote.payableNow <= 0 ? 'pending' : (quote.remainingAmount > 0 ? 'partial_paid' : 'payment_verified'),
                payment_verified_at: quote.payableNow > 0 ? new Date() : null,
                accounting_status: 'pending',
                page_url: '/admin/bookings/create',
                raw_payload: rawPayload
            }, { transaction });

            if (couponPreview) {
                await this.couponService.redeem({
                    coupon: couponPreview.coupon,
                    booking,
                    customerId: customer.id,
                    customerEmail: customerUser.email || null,
                    bookingAmount: requestedBaseAmount,
                    discountAmount: couponDiscountAmount,
                    transaction
                });
            }

            if (BookingPassenger) {
                let passengerData = [];
                if (Array.isArray(passengers) && passengers.length > 0) {
                    passengerData = passengers.map(p => ({
                        booking_id: booking.id,
                        full_name: p.full_name,
                        age: p.age || null,
                        gender: p.gender || null,
                        dob: p.dob || null,
                        passport_no: p.passport_no || null,
                        passport_expiry: p.passport_expiry || null,
                        is_lead: p.is_lead === true || p.is_lead === 'true'
                    }));
                } else {
                    passengerData = [{
                        booking_id: booking.id,
                        full_name: customerUser.name || 'Lead Passenger',
                        is_lead: true
                    }];
                }
                await BookingPassenger.bulkCreate(passengerData, { transaction });
            }

            let accountingEntry = null;
            if (this.accountingService && typeof this.accountingService.recordPackageBookingSplit === 'function') {
                accountingEntry = await this.accountingService.recordPackageBookingSplit({
                    bookingId: booking.id,
                    bookingRef: booking.booking_reference,
                    packageName: booking.package_name,
                    paidAmount: quote.payableNow,
                    remainingAmount: quote.remainingAmount,
                    taxAmount: quote.taxAmount,
                    vendorAmount: quote.vendorAmount,
                    platformAmount: quote.platformAmount,
                    vendorId: packageRow.vendor_id || null
                }, req.session && req.session.user ? req.session.user.id : null, transaction);
            }

            await booking.update({
                accounting_status: accountingEntry ? 'recorded' : 'skipped',
                accounting_entry_id: accountingEntry ? accountingEntry.id : null
            }, { transaction });

            if (inquiry_id) {
                const TripInquiry = sequelize.models.TripInquiry;
                if (TripInquiry) {
                    await TripInquiry.update({ status: 'converted' }, {
                        where: { id: inquiry_id },
                        transaction
                    });
                }
                await this.markRelatedLeadWon(inquiry_id, booking, transaction);
            }

            await transaction.commit();
            transaction = null;

            res.status(201).json({
                success: true,
                packageBookingId: booking.id,
                packageBookingReference: booking.booking_reference,
                redirectUrl: `/admin/bookings/package-bookings?search=${encodeURIComponent(booking.booking_reference)}`
            });
        } catch (e) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error(e);
            res.status(e.statusCode || 500).json({ success: false, message: e.message });
        }
    }

    tripDurationDays(trip) {
        if (trip && Array.isArray(trip.days) && trip.days.length) return trip.days.length;
        if (trip && trip.start_date && trip.end_date) {
            const start = new Date(trip.start_date);
            const end = new Date(trip.end_date);
            const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
            return Math.max(diff, 1);
        }
        return 1;
    }

    tripAmounts(trip) {
        let taxAmount = this.money(trip ? trip.total_tax : 0);
        let packageTotal = this.money(trip ? trip.total_price : 0);
        let baseAmount = this.money(trip ? trip.base_price : 0);

        if (!baseAmount && packageTotal) {
            baseAmount = this.money(Math.max(packageTotal - taxAmount, 0));
        }
        if (!packageTotal) {
            packageTotal = this.money(baseAmount + taxAmount);
        }
        if (!taxAmount && packageTotal > baseAmount) {
            taxAmount = this.money(packageTotal - baseAmount);
        }

        return {
            baseAmount,
            taxAmount,
            packageTotal,
            taxPercent: baseAmount > 0 ? this.money((taxAmount / baseAmount) * 100) : 0
        };
    }

    async loadDestinationMap(destinationIds, transaction = null) {
        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const Destination = sequelize.models.Destination;
        if (!Destination || !destinationIds.length) return new Map();

        const rows = await Destination.findAll({
            where: { id: destinationIds },
            transaction
        });
        return new Map(rows.map(row => [String(row.id), row]));
    }

    buildRoute(trip, destinationMap) {
        const ids = [];
        (trip.days || []).forEach(day => {
            const id = day.destination_id || trip.destination_id;
            if (id && !ids.includes(String(id))) ids.push(String(id));
        });
        if (!ids.length && trip.destination_id) ids.push(String(trip.destination_id));

        return ids.map(id => {
            const destination = destinationMap.get(String(id));
            return destination ? destination.name : `Destination #${id}`;
        });
    }

    buildHotelSnapshot(trip) {
        return (trip.days || [])
            .filter(day => day.hotel)
            .map(day => ({
                day_number: day.day_number,
                id: day.hotel.id,
                name: day.hotel.name,
                destination_id: day.hotel.destination_id || day.destination_id || null,
                price_per_night: this.money(day.hotel.price_per_night),
                estimated_amount: this.money(day.hotel.price_per_night),
                rooms: 1,
                nights: 1
            }));
    }

    async getCustomerSnapshot(trip, transaction = null) {
        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const Customer = this.bookingRepo.Customer;
        const User = sequelize.models.User;

        if (!Customer || !trip.customer_id) {
            return { id: trip.customer_id || null, name: null, email: null, phone: null };
        }

        const customer = await Customer.findByPk(trip.customer_id, {
            include: User ? [{ model: User, as: 'user', required: false }] : [],
            transaction
        });

        return {
            id: trip.customer_id,
            name: customer && customer.user ? customer.user.name : null,
            email: customer && customer.user ? customer.user.email : null,
            phone: customer ? customer.phone : null
        };
    }

    async createPackageItinerary(packageRow, trip, transaction) {
        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const PackageDestination = sequelize.models.PackageDestination;

        if (!PackageDestination) return;

        const days = Array.isArray(trip.days) && trip.days.length
            ? [...trip.days].sort((a, b) => Number(a.day_number || 0) - Number(b.day_number || 0))
            : [{ day_number: 1, destination_id: trip.destination_id, activities: [] }];

        const groups = [];
        days.forEach(day => {
            const destinationId = day.destination_id || trip.destination_id;
            if (!destinationId) return;

            let group = groups.find(item => String(item.destinationId) === String(destinationId));
            if (!group) {
                group = { destinationId, days: [] };
                groups.push(group);
            }
            group.days.push(day);
        });

        for (let index = 0; index < groups.length; index += 1) {
            const group = groups[index];
            const activities = {};

            group.days.forEach(day => {
                const dayItems = [];
                if (day.hotel) {
                    dayItems.push({
                        id: `hotel-${day.hotel.id || day.day_number}`,
                        type: 'hotel',
                        name: `Hotel: ${day.hotel.name}`,
                        duration: 'Stay',
                        description: day.hotel.description || `Estimated hotel amount INR ${this.money(day.hotel.price_per_night)}`,
                        price: this.money(day.hotel.price_per_night),
                        image: day.hotel.image_url || ''
                    });
                }

                (day.activities || []).forEach(item => {
                    const catalog = item.activity || {};
                    dayItems.push({
                        id: `activity-${item.id || catalog.id || `${day.day_number}-${dayItems.length}`}`,
                        type: 'activity',
                        name: catalog.name || item.title || 'Activity',
                        duration: catalog.duration_minutes ? `${catalog.duration_minutes} mins` : 'Full Day',
                        description: item.description || catalog.description || null,
                        price: this.money(catalog.price || 0),
                        image: catalog.image || ''
                    });
                });

                activities[day.day_number] = dayItems;
            });

            await PackageDestination.create({
                package_id: packageRow.id,
                destination_id: group.destinationId,
                nights: Math.max(group.days.length, 1),
                activities,
                order: index + 1
            }, { transaction });
        }
    }

    async createAutoPackage(trip, context = {}, transaction = null) {
        const Package = this.bookingRepo.Package;
        if (!Package) throw new Error('Package model is not configured.');

        const destinationIds = [
            ...new Set((trip.days || [])
                .map(day => day.destination_id || trip.destination_id)
                .filter(Boolean)
                .map(String))
        ];
        if (!destinationIds.length && trip.destination_id) destinationIds.push(String(trip.destination_id));

        const destinationMap = await this.loadDestinationMap(destinationIds, transaction);
        const route = this.buildRoute(trip, destinationMap);
        const customer = context.customer || {};
        const amounts = this.tripAmounts(trip);
        if (amounts.packageTotal <= 0) {
            throw new Error('Package amount must be greater than zero before confirming booking.');
        }

        const nameParts = [
            route.length ? `${route.join(' to ')} Custom Package` : 'Custom Package',
            customer.name ? `for ${customer.name}` : null
        ].filter(Boolean);
        const packageName = nameParts.join(' ');
        const slug = this.slugify(`custom-trip-${trip.id}-${packageName}`);

        let packageRow = await Package.findOne({ where: { slug }, transaction });
        if (!packageRow) {
            packageRow = await Package.create({
                name: packageName,
                slug,
                duration_days: this.tripDurationDays(trip),
                price: Math.round(amounts.baseAmount),
                discount_percentage: 0,
                tax_type: amounts.taxAmount > 0 ? 'Custom Trip Tax' : null,
                tax_percent: amounts.taxPercent,
                status: false,
                show_in_home_page: false,
                is_customizable: true,
                description: `Auto-created from custom trip #${trip.id}.`,
                vendor_id: null
            }, { transaction });

            await this.createPackageItinerary(packageRow, trip, transaction);
        }

        return { packageRow, route, destinationMap, amounts };
    }

    async createPackageBookingFromTrip(trip, context = {}, transaction = null) {
        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const PackageBooking = sequelize.models.PackageBooking;
        if (!PackageBooking) throw new Error('Package booking model is not configured.');

        const bookingReference = this.packageBookingReference(trip.id);
        const existing = await PackageBooking.findOne({
            where: { booking_reference: bookingReference },
            transaction
        });
        if (existing) return existing;

        const customer = await this.getCustomerSnapshot(trip, transaction);
        const { packageRow, route, amounts } = await this.createAutoPackage(trip, { ...context, customer }, transaction);
        const hotels = this.buildHotelSnapshot(trip);
        const rawPayload = {
            source: 'admin_custom_trip_builder',
            custom_trip_id: trip.id,
            inquiry_id: context.inquiryId || null,
            route,
            hotels,
            hotel_count: hotels.length,
            hotel_estimated_amount: this.money(hotels.reduce((sum, hotel) => sum + Number(hotel.estimated_amount || 0), 0)),
            start_date: trip.start_date || null,
            end_date: trip.end_date || null,
            departure_date: trip.start_date || null,
            destination_breakdown: context.destinationBreakdown || [],
            pricing: {
                package_base_amount: amounts.baseAmount,
                tax_amount: amounts.taxAmount,
                package_total: amounts.packageTotal,
                paid_amount: 0,
                remaining_amount: amounts.packageTotal
            },
            tax_breakdown: trip.tax_breakdown || {}
        };

        const booking = await PackageBooking.create({
            booking_reference: bookingReference,
            package_id: packageRow.id,
            package_slug: packageRow.slug || null,
            package_name: packageRow.name || null,
            vendor_id: null,
            customer_id: customer.id || null,
            customer_name: customer.name || null,
            customer_email: customer.email || null,
            customer_phone: customer.phone || null,
            package_base_amount: amounts.baseAmount,
            tax_type: packageRow.tax_type || null,
            tax_percent: amounts.taxPercent,
            tax_amount: amounts.taxAmount,
            package_total: amounts.packageTotal,
            paid_amount: 0,
            remaining_amount: amounts.packageTotal,
            coupon_discount_amount: 0,
            coupon_snapshot: {},
            vendor_amount: 0,
            platform_amount: amounts.baseAmount,
            vendor_split_basis: 'custom_package',
            partial_booking_enabled: false,
            partial_booking_percentage: 0,
            payment_status: 'pending',
            accounting_status: 'pending',
            page_url: `/admin/bookings/${trip.id}`,
            raw_payload: rawPayload
        }, { transaction });

        let accountingEntry = null;
        if (this.accountingService && typeof this.accountingService.recordPackageBookingSplit === 'function') {
            accountingEntry = await this.accountingService.recordPackageBookingSplit({
                bookingId: booking.id,
                bookingRef: booking.booking_reference,
                packageName: booking.package_name,
                paidAmount: 0,
                remainingAmount: amounts.packageTotal,
                taxAmount: amounts.taxAmount,
                vendorAmount: 0,
                platformAmount: amounts.baseAmount,
                vendorId: null
            }, context.userId || null, transaction);
        }

        await booking.update({
            accounting_status: accountingEntry ? 'recorded' : 'skipped',
            accounting_entry_id: accountingEntry ? accountingEntry.id : null
        }, { transaction });

        return booking;
    }

    async markRelatedLeadWon(inquiryId, packageBooking, transaction = null) {
        if (!inquiryId || !packageBooking) return null;

        const sequelize = this.bookingRepo.CustomTrip.sequelize;
        const Lead = sequelize.models.Lead;
        if (!Lead) return null;

        const Op = sequelize.Sequelize.Op;
        const inquiryRef = String(inquiryId);
        let lead = null;

        try {
            lead = await Lead.findOne({
                where: {
                    custom_fields: {
                        [Op.contains]: { custom_booking_id: inquiryRef }
                    }
                },
                transaction
            });
        } catch (error) {
            lead = null;
        }

        if (!lead) {
            try {
                lead = await Lead.findOne({
                    where: sequelize.where(
                        sequelize.cast(sequelize.col('custom_fields'), 'TEXT'),
                        { [Op.iLike]: `%${inquiryRef}%` }
                    ),
                    transaction
                });
            } catch (error) {
                lead = null;
            }
        }

        if (!lead) return null;

        const update = {
            status: 'won',
            custom_fields: {
                ...(lead.custom_fields || {}),
                package_booking_id: packageBooking.id,
                package_booking_reference: packageBooking.booking_reference,
                package_id: packageBooking.package_id
            }
        };

        const PipelineStage = sequelize.models.PipelineStage;
        if (PipelineStage && lead.pipeline_id) {
            const wonStage = await PipelineStage.findOne({
                where: {
                    pipeline_id: lead.pipeline_id,
                    [Op.or]: [
                        { name: { [Op.iLike]: '%won%' } },
                        { name: { [Op.iLike]: '%booking confirmed%' } },
                        { name: { [Op.iLike]: '%booked%' } },
                        { name: { [Op.iLike]: '%converted%' } }
                    ]
                },
                order: [['order', 'ASC']],
                transaction
            });

            if (wonStage) update.stage_id = wonStage.id;
        }

        await lead.update(update, { transaction });
        return lead;
    }

    async checkout(req, res) {
        let transaction = null;

        try {
            const { tripId, destination_breakdown, inquiry_id, use_trip_amounts } = req.body;
            const trip = await this.tripBuilderService.getTripDetails(tripId);
            if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

            const sequelize = this.bookingRepo.CustomTrip.sequelize;
            transaction = await sequelize.transaction();

            // Tax Calculation Engine
            const hasManualBreakdown = Array.isArray(destination_breakdown)
                && destination_breakdown.some(item => Number(item.amount || 0) > 0);
            if (hasManualBreakdown && !use_trip_amounts) {
                const Destination = this.bookingRepo.CustomTrip.associations.destination.target;
                
                // Fetch full destination models for the breakdown
                const enrichedBreakdown = await Promise.all(destination_breakdown.map(async (item) => {
                    const destModel = await Destination.findByPk(item.destId);
                    return {
                        amount: item.amount,
                        destinationModel: destModel
                    };
                }));

                const TaxCalculationService = require('../services/TaxCalculationService');
                const taxService = new TaxCalculationService('Delhi');
                const taxResult = taxService.calculateTripTaxes(enrichedBreakdown);

                await trip.update({
                    base_price: taxResult.base_price,
                    total_tax: taxResult.total_tax,
                    tax_breakdown: taxResult.tax_breakdown,
                    total_price: taxResult.grand_total 
                }, { transaction });
                trip.total_price = taxResult.grand_total; // update local instance for reference
                trip.base_price = taxResult.base_price;
                trip.total_tax = taxResult.total_tax;
                trip.tax_breakdown = taxResult.tax_breakdown;
            }

            // Update CustomTrip status to booked
            await trip.update({ status: 'booked' }, { transaction });

            const packageBooking = await this.createPackageBookingFromTrip(trip, {
                destinationBreakdown: Array.isArray(destination_breakdown) ? destination_breakdown : [],
                inquiryId: inquiry_id || null,
                userId: req.session.user ? req.session.user.id : null
            }, transaction);

            if (inquiry_id) {
                const TripInquiry = sequelize.models.TripInquiry;
                if (TripInquiry) {
                    await TripInquiry.update({ status: 'converted' }, {
                        where: { id: inquiry_id },
                        transaction
                    });
                }

                await this.markRelatedLeadWon(inquiry_id, packageBooking, transaction);
            }

            await transaction.commit();
            transaction = null;

            res.json({
                success: true,
                bookingId: trip.id,
                packageBookingId: packageBooking.id,
                packageBookingReference: packageBooking.booking_reference,
                redirectUrl: `/admin/bookings/package-bookings?search=${encodeURIComponent(packageBooking.booking_reference)}`
            });
        } catch (e) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error(e);
            res.status(500).json({ success: false, message: e.message });
        }
    }
}
module.exports = AdminTripBuilderController;
