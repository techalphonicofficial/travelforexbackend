const { Op, fn, col } = require('sequelize');

const cleanAccessValue = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeAccessValue = (value) => cleanAccessValue(value).toLowerCase().replace(/[\s-]+/g, '_');
const canRefundPackages = (user = {}) => {
    const roleValue = typeof user.role === 'string' ? user.role : (user.role && user.role.name);
    const roleName = normalizeAccessValue(user.role_name || user.roleName || roleValue);
    const type = normalizeAccessValue(user.type);
    return ['admin', 'manager'].includes(type) || ['admin', 'manager'].includes(roleName);
};

class AdminBookingController {
    constructor(bookingRepo, accountingService, walletService, tripInquiryRepo = null, hotelBookingRepo = null) {
        this.bookingRepo = bookingRepo;
        this.accountingService = accountingService;
        this.walletService = walletService;
        this.tripInquiryRepo = tripInquiryRepo;
        this.hotelBookingRepo = hotelBookingRepo;
    }

    async canProcessPackageRefund(sessionUser, User, Role) {
        if (!sessionUser) return false;

        if (User && sessionUser.id) {
            try {
                const include = Role ? [{ model: Role, as: 'role', attributes: ['id', 'name'] }] : [];
                const dbUser = await User.findByPk(sessionUser.id, {
                    include,
                    attributes: ['id', 'name', 'email', 'type', 'role_id', 'status']
                });
                if (!dbUser || dbUser.status === false) return false;

                const plainUser = dbUser.get ? dbUser.get({ plain: true }) : dbUser;
                return canRefundPackages({
                    ...plainUser,
                    role_name: plainUser.role ? plainUser.role.name : plainUser.role_name
                });
            } catch (error) {
                console.error('Package refund UI role lookup error:', error.message);
                return false;
            }
        }

        return canRefundPackages(sessionUser);
    }

    async index(req, res) {
        try {
            res.redirect('/admin/bookings/inquiries');
        } catch (e) {
            console.error(e);
            res.status(500).send('Internal Server Error');
        }
    }




    async create(req, res) {
        try {
            const User = this.bookingRepo.CustomTrip.sequelize.models.User;
            const Destination = this.bookingRepo.CustomTrip.associations.destination.target;

            const customers = await this.bookingRepo.Customer.findAll({
                include: [{ model: User, as: 'user', where: { type: 'customer' } }],
                order: [[{ model: User, as: 'user' }, 'name', 'ASC']]
            });

            const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
            const packages = await this.bookingRepo.Package.findAll({ order: [['name', 'ASC']] });

            // If inquiry_id is passed, fetch the inquiry
            let inquiry = null;
            if (req.query.inquiry_id && this.tripInquiryRepo) {
                inquiry = await this.tripInquiryRepo.findById(req.query.inquiry_id);
            }

            res.render('admin/bookings/builder', {
                title: 'Trip Builder',
                customers,
                destinations,
                packages,
                inquiry,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error loading builder:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async inquiries(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const limitOptions = [10, 20, 50];
            let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const requestedLimit = parseInt(req.query.limit, 10) || 10;
            const limit = limitOptions.includes(requestedLimit) ? requestedLimit : 10;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const source = 'custom';

            let result = await this.tripInquiryRepo.findPaginated(page, limit, search, status, source);

            const totalPages = Math.max(1, Math.ceil(result.count / limit));
            if (page > totalPages) {
                page = totalPages;
                result = await this.tripInquiryRepo.findPaginated(page, limit, search, status, source);
            }

            const statusRows = await this.tripInquiryRepo.countByStatus(source);
            const statusCounts = statusRows.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count, 10);
                return acc;
            }, {});

            res.render('admin/bookings/inquiries', {
                title: 'Custom Trip Inquiries',
                inquiries: result.rows,
                currentPage: page,
                totalPages,
                totalInquiries: result.count,
                limit,
                limitOptions,
                searchQuery: search,
                statusFilter: status,
                statusCounts,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching trip inquiries:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async hotelBookings(req, res) {
        try {
            if (!this.hotelBookingRepo) {
                return res.status(500).send('Hotel booking repository is not configured');
            }

            const statuses = ['new', 'contacted', 'quoted', 'converted', 'cancelled'];
            const limitOptions = [10, 20, 50];
            let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const requestedLimit = parseInt(req.query.limit, 10) || 10;
            const limit = limitOptions.includes(requestedLimit) ? requestedLimit : 10;
            const search = req.query.search || '';
            const status = statuses.includes(req.query.status) ? req.query.status : '';

            let result = await this.hotelBookingRepo.findPaginated({ page, limit, search, status });
            const totalPages = Math.max(1, Math.ceil(result.count / limit));
            if (page > totalPages) {
                page = totalPages;
                result = await this.hotelBookingRepo.findPaginated({ page, limit, search, status });
            }

            const statusRows = await this.hotelBookingRepo.countByStatus();
            const statusCounts = statusRows.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count, 10);
                return acc;
            }, {});

            res.render('admin/bookings/hotel-bookings', {
                title: 'Hotel Bookings',
                bookings: result.rows.map(row => row.get ? row.get({ plain: true }) : row),
                currentPage: page,
                totalPages,
                totalBookings: result.count,
                limit,
                limitOptions,
                searchQuery: search,
                statusFilter: status,
                statusCounts,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching hotel bookings:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async packageBookings(req, res) {
        try {
            const PackageBooking = this.bookingRepo.CustomTrip.sequelize.models.PackageBooking;
            const Package = this.bookingRepo.Package;
            const Customer = this.bookingRepo.Customer;
            const User = this.bookingRepo.CustomTrip.sequelize.models.User;
            const Role = this.bookingRepo.CustomTrip.sequelize.models.Role;
            const canProcessPackageRefundAction = await this.canProcessPackageRefund(req.session.user, User, Role);

            if (!PackageBooking) {
                return res.status(500).send('Package booking model is not configured');
            }

            const paymentStatuses = [
                'pending',
                'payment_initiated',
                'paid',
                'payment_verified',
                'partial_paid',
                'partially_refunded',
                'partially_cancelled',
                'refunded',
                'failed',
                'cancelled'
            ];
            const limitOptions = [10, 20, 50];
            let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const requestedLimit = parseInt(req.query.limit, 10) || 10;
            const limit = limitOptions.includes(requestedLimit) ? requestedLimit : 10;
            const search = String(req.query.search || '').trim();
            const status = paymentStatuses.includes(req.query.status) ? req.query.status : '';

            const searchWhere = {};
            if (search) {
                searchWhere[Op.or] = [
                    { booking_reference: { [Op.iLike]: `%${search}%` } },
                    { package_name: { [Op.iLike]: `%${search}%` } },
                    { package_slug: { [Op.iLike]: `%${search}%` } },
                    { customer_name: { [Op.iLike]: `%${search}%` } },
                    { customer_email: { [Op.iLike]: `%${search}%` } },
                    { customer_phone: { [Op.iLike]: `%${search}%` } },
                    { '$vendor.name$': { [Op.iLike]: `%${search}%` } },
                    { '$vendor.email$': { [Op.iLike]: `%${search}%` } },
                    { coupon_code: { [Op.iLike]: `%${search}%` } },
                    { razorpay_order_id: { [Op.iLike]: `%${search}%` } },
                    { razorpay_payment_id: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const where = { ...searchWhere };
            if (status) {
                where.payment_status = status;
            }

            const include = [
                Package ? { model: Package, as: 'package', required: false, attributes: ['id', 'name', 'slug', 'vendor_id'] } : null,
                User ? { model: User, as: 'vendor', required: false, attributes: ['id', 'name', 'email'] } : null,
                Customer ? { model: Customer, as: 'customer', required: false, attributes: ['id', 'user_id', 'phone'] } : null
            ].filter(Boolean);
            const summaryInclude = include.map(item => ({ ...item, attributes: [] }));

            let result = await PackageBooking.findAndCountAll({
                where,
                include,
                limit,
                offset: (page - 1) * limit,
                order: [['created_at', 'DESC']]
            });

            const totalPages = Math.max(1, Math.ceil(result.count / limit));
            if (page > totalPages) {
                page = totalPages;
                result = await PackageBooking.findAndCountAll({
                    where,
                    include,
                    limit,
                    offset: (page - 1) * limit,
                    order: [['created_at', 'DESC']]
                });
            }

            const [packageTotal, paidTotal, remainingTotal, vendorTotal, platformTotal, taxTotal, statusRows] = await Promise.all([
                PackageBooking.sum('package_total', { where, include: summaryInclude }),
                PackageBooking.sum('paid_amount', { where, include: summaryInclude }),
                PackageBooking.sum('remaining_amount', { where, include: summaryInclude }),
                PackageBooking.sum('vendor_amount', { where, include: summaryInclude }),
                PackageBooking.sum('platform_amount', { where, include: summaryInclude }),
                PackageBooking.sum('tax_amount', { where, include: summaryInclude }),
                PackageBooking.findAll({
                    attributes: ['payment_status', [fn('COUNT', col('payment_status')), 'count']],
                    where: searchWhere,
                    include: summaryInclude,
                    group: ['payment_status'],
                    raw: true
                })
            ]);

            const statusCounts = statusRows.reduce((acc, item) => {
                acc[item.payment_status] = parseInt(item.count, 10);
                return acc;
            }, {});

            res.render('admin/bookings/package-bookings', {
                title: 'Package Bookings',
                bookings: result.rows.map(row => row.get ? row.get({ plain: true }) : row),
                currentPage: page,
                totalPages,
                totalBookings: result.count,
                limit,
                limitOptions,
                searchQuery: search,
                statusFilter: status,
                paymentStatuses,
                statusCounts,
                totals: {
                    packageTotal: Number(packageTotal || 0),
                    paidTotal: Number(paidTotal || 0),
                    remainingTotal: Number(remainingTotal || 0),
                    vendorTotal: Number(vendorTotal || 0),
                    platformTotal: Number(platformTotal || 0),
                    taxTotal: Number(taxTotal || 0)
                },
                canProcessPackageRefund: canProcessPackageRefundAction,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching package bookings:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async returnRequests(req, res) {
        try {
            const sequelize = this.bookingRepo.CustomTrip.sequelize;
            const PackageReturnRequest = sequelize.models.PackageReturnRequest;
            const PackageBooking = sequelize.models.PackageBooking;
            const User = sequelize.models.User;
            const Role = sequelize.models.Role;
            const canProcessPackageRefundAction = await this.canProcessPackageRefund(req.session.user, User, Role);

            if (!PackageReturnRequest) {
                return res.status(500).send('Package return request model is not configured');
            }

            const statuses = ['pending', 'approved', 'rejected'];
            const limitOptions = [10, 20, 50];
            let page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const requestedLimit = parseInt(req.query.limit, 10) || 10;
            const limit = limitOptions.includes(requestedLimit) ? requestedLimit : 10;
            const search = String(req.query.search || '').trim();
            const status = statuses.includes(req.query.status) ? req.query.status : 'pending';

            const where = {};
            if (status) where.status = status;
            if (search) {
                where[Op.or] = [
                    { booking_reference: { [Op.iLike]: `%${search}%` } },
                    { customer_name: { [Op.iLike]: `%${search}%` } },
                    { customer_email: { [Op.iLike]: `%${search}%` } },
                    { customer_phone: { [Op.iLike]: `%${search}%` } },
                    { reason: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const include = [
                PackageBooking ? {
                    model: PackageBooking,
                    as: 'booking',
                    required: false,
                    attributes: ['id', 'booking_reference', 'package_name', 'package_total', 'paid_amount', 'remaining_amount', 'payment_status']
                } : null,
                User ? { model: User, as: 'requestedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null,
                User ? { model: User, as: 'approvedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null,
                User ? { model: User, as: 'rejectedBy', required: false, attributes: ['id', 'name', 'email', 'type'] } : null
            ].filter(Boolean);

            let result = await PackageReturnRequest.findAndCountAll({
                where,
                include,
                limit,
                offset: (page - 1) * limit,
                order: [['created_at', 'DESC']]
            });

            const totalPages = Math.max(1, Math.ceil(result.count / limit));
            if (page > totalPages) {
                page = totalPages;
                result = await PackageReturnRequest.findAndCountAll({
                    where,
                    include,
                    limit,
                    offset: (page - 1) * limit,
                    order: [['created_at', 'DESC']]
                });
            }

            const statusRows = await PackageReturnRequest.findAll({
                attributes: ['status', [fn('COUNT', col('status')), 'count']],
                group: ['status'],
                raw: true
            });
            const statusCounts = statusRows.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count, 10);
                return acc;
            }, {});

            res.render('admin/bookings/return-requests', {
                title: 'Package Cancel Requests',
                requests: result.rows.map(row => row.get ? row.get({ plain: true }) : row),
                currentPage: page,
                totalPages,
                totalRequests: result.count,
                limit,
                limitOptions,
                searchQuery: search,
                statusFilter: status,
                statuses,
                statusCounts,
                canProcessPackageRefund: canProcessPackageRefundAction,
                successMessage: req.query.success || '',
                errorMessage: req.query.error || '',
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching package return requests:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async updateHotelBookingStatus(req, res) {
        let transaction = null;
        try {
            if (!this.hotelBookingRepo) {
                return res.status(500).send('Hotel booking repository is not configured');
            }

            const allowed = ['new', 'contacted', 'quoted', 'converted', 'cancelled'];
            const { status, notes } = req.body;
            if (!allowed.includes(status)) {
                return res.status(400).send('Invalid hotel booking status');
            }

            transaction = await this.hotelBookingRepo.HotelBooking.sequelize.transaction();
            const booking = await this.hotelBookingRepo.updateStatus(req.params.id, status, notes || null, transaction);
            if (!booking) {
                await transaction.rollback();
                transaction = null;
                return res.status(404).send('Hotel booking not found');
            }

            if (status === 'converted' && this.accountingService && typeof this.accountingService.recordConvertedHotelBooking === 'function') {
                const rawPayload = booking.raw_payload || {};
                await this.accountingService.recordConvertedHotelBooking({
                    bookingId: booking.id,
                    hotelName: rawPayload.hotel_name || `Hotel #${booking.hotel_id}`,
                    baseAmount: booking.base_amount,
                    commissionAmount: booking.commission_amount,
                    totalAmount: booking.total_amount,
                    userId: req.session.user ? req.session.user.id : null,
                    transaction
                });
            }

            await transaction.commit();
            transaction = null;

            const redirectTo = req.headers.referer || '/admin/bookings/hotel-bookings';
            res.redirect(redirectTo);
        } catch (error) {
            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Error rolling back hotel booking status update:', rollbackError);
                }
            }
            console.error('Error updating hotel booking status:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async showInquiry(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const inquiry = await this.tripInquiryRepo.findById(req.params.id);
            if (!inquiry) {
                return res.status(404).send('Inquiry not found');
            }

            // Enrich cities with day-wise itinerary activities dynamically if they are missing
            if (inquiry.cities && Array.isArray(inquiry.cities)) {
                for (const city of inquiry.cities) {
                    if (!city.activities || !Array.isArray(city.activities) || city.activities.length === 0) {
                        if (city.id) {
                            const dest = await this.tripInquiryRepo.findDestinationById(city.id);
                            if (dest && dest.activities_data) {
                                city.activities = dest.activities_data;
                            }
                        }
                    }
                }
            }

            const Review = this.bookingRepo.CustomTrip.sequelize.models.Review;
            const reviewRows = Review
                ? await Review.findAll({
                    where: {
                        reviewable_type: 'custom_package',
                        trip_inquiry_id: inquiry.id
                    },
                    order: [['created_at', 'DESC']]
                })
                : [];
            const inquiryReviews = reviewRows.map(row => row.toJSON ? row.toJSON() : row);
            const approvedReviews = inquiryReviews.filter(review => review.status === 'approved');
            const totalRating = approvedReviews.reduce((sum, review) => sum + (parseInt(review.rating, 10) || 0), 0);
            const inquiryReviewSummary = {
                count: approvedReviews.length,
                average_rating: approvedReviews.length ? Number((totalRating / approvedReviews.length).toFixed(1)) : 0
            };

            res.render('admin/bookings/inquiry-show', {
                title: inquiry.source === 'hotel_booking' ? 'Hotel Booking Enquiry' : 'Custom Inquiry Details',
                inquiry,
                inquiryReviews,
                inquiryReviewSummary,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching inquiry details:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async createInquiryReview(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).json({ success: false, message: 'Trip inquiry repository is not configured' });
            }

            const inquiry = await this.tripInquiryRepo.findById(req.params.id);
            if (!inquiry) {
                return res.status(404).json({ success: false, message: 'Inquiry not found' });
            }

            const rating = parseInt(req.body.rating, 10);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            }

            const status = ['pending', 'approved', 'rejected'].includes(req.body.status)
                ? req.body.status
                : 'approved';
            const textOrNull = value => {
                if (value === undefined || value === null) return null;
                const text = String(value).trim();
                return text || null;
            };

            const Review = this.bookingRepo.CustomTrip.sequelize.models.Review;
            const review = await Review.create({
                reviewable_type: 'custom_package',
                reviewable_id: null,
                package_id: null,
                custom_trip_id: null,
                trip_inquiry_id: inquiry.id,
                customer_id: inquiry.customer_id || null,
                rating,
                title: textOrNull(req.body.title),
                comment: textOrNull(req.body.comment),
                reviewer_name: textOrNull(req.body.reviewer_name || inquiry.customer_name),
                reviewer_email: textOrNull(req.body.reviewer_email || inquiry.customer_email),
                reviewer_phone: textOrNull(req.body.reviewer_phone || inquiry.customer_phone),
                status,
                source: 'admin',
                metadata: {
                    inquiry_id: inquiry.id,
                    destination: inquiry.destination,
                    destination_slug: inquiry.destination_slug
                }
            });

            res.json({ success: true, message: 'Custom package review added successfully', data: review });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateInquiryReview(req, res) {
        try {
            const Review = this.bookingRepo.CustomTrip.sequelize.models.Review;
            const review = await Review.findByPk(req.params.reviewId);
            if (!review || review.reviewable_type !== 'custom_package' || review.trip_inquiry_id !== req.params.id) {
                return res.status(404).json({ success: false, message: 'Review not found for this inquiry' });
            }

            const rating = parseInt(req.body.rating, 10);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            }

            const status = ['pending', 'approved', 'rejected'].includes(req.body.status)
                ? req.body.status
                : review.status;
            const textOrNull = value => {
                if (value === undefined || value === null) return null;
                const text = String(value).trim();
                return text || null;
            };

            await review.update({
                rating,
                title: textOrNull(req.body.title),
                comment: textOrNull(req.body.comment),
                reviewer_name: textOrNull(req.body.reviewer_name),
                reviewer_email: textOrNull(req.body.reviewer_email),
                reviewer_phone: textOrNull(req.body.reviewer_phone),
                status
            });

            res.json({ success: true, message: 'Custom package review updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteInquiryReview(req, res) {
        try {
            const Review = this.bookingRepo.CustomTrip.sequelize.models.Review;
            const review = await Review.findByPk(req.params.reviewId);
            if (!review || review.reviewable_type !== 'custom_package' || review.trip_inquiry_id !== req.params.id) {
                return res.status(404).json({ success: false, message: 'Review not found for this inquiry' });
            }

            await review.destroy();
            res.json({ success: true, message: 'Custom package review deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateInquiryStatus(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const allowed = ['new', 'contacted', 'quoted', 'converted', 'cancelled'];
            const { status, notes } = req.body;

            if (!allowed.includes(status)) {
                return res.status(400).send('Invalid inquiry status');
            }

            const existingInquiry = await this.tripInquiryRepo.findModelById(req.params.id);
            if (!existingInquiry) {
                return res.status(404).send('Inquiry not found');
            }
            if (existingInquiry.status === 'converted') {
                const redirectTo = req.headers.referer || '/admin/bookings/inquiries';
                return res.redirect(redirectTo);
            }

            const inquiry = await existingInquiry.update({
                status,
                ...(notes !== undefined ? { notes: notes || null } : {})
            });

            // Redirect custom trip inquiries to builder when converted.
            if (status === 'converted' && inquiry.source !== 'hotel_booking') {
                return res.redirect(`/admin/bookings/create?inquiry_id=${req.params.id}`);
            }

            const redirectTo = req.headers.referer || '/admin/bookings/inquiries';
            res.redirect(redirectTo);
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async updateInquiryPrice(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const { base_price } = req.body;
            if (base_price === undefined || isNaN(base_price)) {
                return res.status(400).send('Invalid base price');
            }

            const existingInquiry = await this.tripInquiryRepo.findModelById(req.params.id);
            if (!existingInquiry) {
                return res.status(404).send('Inquiry not found');
            }
            if (existingInquiry.status === 'converted') {
                const redirectTo = req.headers.referer || `/admin/bookings/inquiries/${req.params.id}`;
                return res.redirect(redirectTo);
            }

            const inquiry = await this.tripInquiryRepo.setPrice(req.params.id, base_price);
            if (!inquiry) {
                return res.status(404).send('Inquiry not found');
            }

            const redirectTo = req.headers.referer || `/admin/bookings/inquiries/${req.params.id}`;
            res.redirect(redirectTo);
        } catch (error) {
            console.error('Error updating inquiry price:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async editInquiry(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const inquiry = await this.tripInquiryRepo.findById(req.params.id);
            if (!inquiry) {
                return res.status(404).send('Inquiry not found');
            }
            if (inquiry.status === 'converted') {
                return res.redirect(`/admin/bookings/inquiries/${inquiry.id}`);
            }

            res.render('admin/bookings/inquiry-edit', {
                title: 'Edit Custom Inquiry',
                inquiry,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error loading inquiry edit view:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async updateInquiry(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).send('Trip inquiry repository is not configured');
            }

            const { 
                customer_name, customer_email, customer_phone,
                destination, travel_with, duration,
                departure_city, departure_date, total_travellers,
                base_price, status, notes, cities
            } = req.body;

            const inquiry = await this.tripInquiryRepo.findModelById(req.params.id);
            if (!inquiry) {
                return res.status(404).send('Inquiry not found');
            }
            if (inquiry.status === 'converted') {
                return res.redirect(`/admin/bookings/inquiries/${inquiry.id}`);
            }

            // Parse cities JSON if provided
            let parsedCities = inquiry.cities;
            if (cities !== undefined && cities !== null && cities !== '') {
                try {
                    parsedCities = typeof cities === 'string' ? JSON.parse(cities) : cities;
                } catch (e) {
                    console.warn('Invalid cities JSON submitted, keeping existing data');
                }
            }

            // Update basic fields
            await inquiry.update({
                customer_name: customer_name || null,
                customer_email: customer_email || null,
                customer_phone: customer_phone || null,
                destination: destination || inquiry.destination,
                travel_with: travel_with || null,
                duration: duration || null,
                departure_city: departure_city || null,
                departure_date: departure_date || null,
                total_travellers: parseInt(total_travellers, 10) || 1,
                status: status || inquiry.status,
                notes: notes || null,
                cities: parsedCities
            });

            // Set/recalculate base price & taxes
            if (base_price !== undefined) {
                await this.tripInquiryRepo.setPrice(inquiry.id, base_price);
            }

            // Redirect custom trip inquiries to builder when converted.
            if (status === 'converted' && inquiry.source !== 'hotel_booking') {
                return res.redirect(`/admin/bookings/create?inquiry_id=${inquiry.id}`);
            }

            res.redirect(`/admin/bookings/inquiries/${inquiry.id}`);
        } catch (error) {
            console.error('Error updating inquiry:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async updateInquiryCities(req, res) {
        try {
            if (!this.tripInquiryRepo) {
                return res.status(500).json({ success: false, message: 'Trip inquiry repository is not configured' });
            }
            const inquiry = await this.tripInquiryRepo.findModelById(req.params.id);
            if (!inquiry) {
                return res.status(404).json({ success: false, message: 'Inquiry not found' });
            }
            if (inquiry.status === 'converted') {
                return res.status(409).json({ success: false, message: 'Converted inquiries are frozen' });
            }
            const { cities } = req.body;
            let parsedCities;
            try {
                parsedCities = typeof cities === 'string' ? JSON.parse(cities) : cities;
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid cities JSON' });
            }
            await inquiry.update({ cities: parsedCities });
            return res.json({ success: true, message: 'Cities saved successfully' });
        } catch (error) {
            console.error('Error updating inquiry cities:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async buildBookingFromInquiry(req, res) {
        try {
            if (this.tripInquiryRepo) {
                const inquiry = await this.tripInquiryRepo.findModelById(req.params.id);
                if (inquiry && inquiry.status === 'converted') {
                    return res.redirect(`/admin/bookings/inquiries/${inquiry.id}`);
                }
            }
            res.redirect(`/admin/bookings/create?inquiry_id=${req.params.id}`);
        } catch (error) {
            console.error('Error building booking from inquiry:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async autoCreateBookingFromInquiry(inquiry, req) {
        const CustomTrip = this.bookingRepo.CustomTrip;
        const User = CustomTrip.sequelize.models.User;
        const Customer = this.bookingRepo.Customer;
        const CustomTripDay = CustomTrip.sequelize.models.CustomTripDay;
        const CustomTripActivity = CustomTrip.sequelize.models.CustomTripActivity;

        // Get or create customer user
        let user = await User.findOne({ where: { email: inquiry.customer_email } });
        if (!user) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Welcome@123', 10);
            user = await User.create({
                name: inquiry.customer_name || 'Guest Customer',
                email: inquiry.customer_email,
                password: hashedPassword,
                type: 'customer',
                status: true
            });
        }

        let customer = await Customer.findOne({ where: { user_id: user.id } });
        if (!customer) {
            customer = await Customer.create({
                user_id: user.id,
                phone: inquiry.customer_phone || null
            });
        }

        // Parse departure date
        let startDate = new Date();
        if (inquiry.departure_date) {
            const parsed = Date.parse(inquiry.departure_date);
            if (!isNaN(parsed)) {
                startDate = new Date(parsed);
            }
        }

        // Parse duration
        let durationDays = 7;
        if (inquiry.duration) {
            const match = inquiry.duration.match(/(\d+)/);
            if (match) {
                durationDays = parseInt(match[1], 10);
            }
        }

        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationDays);

        // Get destination_id
        const destId = inquiry.destination_id || (inquiry.cities && inquiry.cities[0] && inquiry.cities[0].id) || 1;

        // Create CustomTrip
        const customTrip = await CustomTrip.create({
            customer_id: customer.id,
            destination_id: destId,
            start_date: startDate,
            end_date: endDate,
            base_price: parseFloat(inquiry.base_price) || 0.00,
            total_tax: parseFloat(inquiry.gst_amount) || 0.00,
            total_price: parseFloat(inquiry.total_amount) || 0.00,
            tax_breakdown: { GST: parseFloat(inquiry.gst_amount) || 0.00 },
            status: 'booked'
        });

        // Populate CustomTripDays and CustomTripActivities
        if (inquiry.cities && Array.isArray(inquiry.cities)) {
            let dayGlobalIndex = 1;
            for (const city of inquiry.cities) {
                if (city.activities && Array.isArray(city.activities)) {
                    for (const dayObj of city.activities) {
                        const tripDay = await CustomTripDay.create({
                            custom_trip_id: customTrip.id,
                            day_number: dayGlobalIndex++,
                            destination_id: city.id,
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

        const bookingRef = 'PT-BKB' + String(customTrip.id).padStart(5, '0');

        // Trigger Accounting
        if (this.accountingService) {
            try {
                await this.accountingService.recordConfirmedBooking(
                    customTrip.id, 
                    bookingRef, 
                    customTrip.total_price, 
                    req.session.user ? req.session.user.id : null
                );
            } catch (accErr) {
                console.error('Error recording accounting entry:', accErr);
            }
        }
    }

    async show(req, res) {
        try {
            const CustomTrip = this.bookingRepo.CustomTrip;
            const User = CustomTrip.sequelize.models.User;
            const Customer = this.bookingRepo.Customer;
            const Payment = this.bookingRepo.Payment;
            
            const customTrip = await CustomTrip.findByPk(req.params.id, {
                include: [
                    { model: CustomTrip.associations.destination.target, as: 'destination' },
                    { 
                        model: Customer, 
                        as: 'customer',
                        include: [{ model: User, as: 'user' }]
                    },
                    { 
                        model: CustomTrip.associations.days.target, 
                        as: 'days',
                        include: [
                            { model: CustomTrip.associations.days.target.associations.hotel.target, as: 'hotel' },
                            { 
                                model: CustomTrip.associations.days.target.associations.activities.target, 
                                as: 'activities',
                                include: [
                                    { model: CustomTrip.associations.days.target.associations.activities.target.associations.activity.target, as: 'activity' }
                                ]
                            }
                        ]
                    },
                    { model: Payment, as: 'payments' }
                ]
            });

            if (!customTrip) {
                return res.status(404).send('Booking details not found');
            }

            // Sort days
            if (customTrip.days) {
                customTrip.days.sort((a, b) => a.day_number - b.day_number);
            }

            // Mock booking object for compatibility with show.ejs
            const booking = {
                id: customTrip.id,
                booking_reference: 'PT-BKB' + String(customTrip.id).padStart(5, '0'),
                type: 'custom_trip',
                total_amount: customTrip.total_price,
                payment_status: (customTrip.payments && customTrip.payments.length > 0 && customTrip.payments.some(p => p.status === 'success')) ? 'paid' : 'pending',
                created_at: customTrip.created_at,
                updated_at: customTrip.updated_at,
                customer: customTrip.customer,
                custom_trip: customTrip,
                payments: customTrip.payments || []
            };

            res.render('admin/bookings/show', {
                title: 'Booking Details',
                booking,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching booking details:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async edit(req, res) {
        try {
            const CustomTrip = this.bookingRepo.CustomTrip;
            const User = CustomTrip.sequelize.models.User;
            const Customer = this.bookingRepo.Customer;
            
            const customTrip = await CustomTrip.findByPk(req.params.id, {
                include: [
                    { model: CustomTrip.associations.destination.target, as: 'destination' },
                    { 
                        model: Customer, 
                        as: 'customer',
                        include: [{ model: User, as: 'user' }]
                    },
                    { 
                        model: CustomTrip.associations.days.target, 
                        as: 'days',
                        include: [
                            { model: CustomTrip.associations.days.target.associations.hotel.target, as: 'hotel' },
                            { 
                                model: CustomTrip.associations.days.target.associations.activities.target, 
                                as: 'activities',
                                include: [
                                    { model: CustomTrip.associations.days.target.associations.activities.target.associations.activity.target, as: 'activity' }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!customTrip) {
                return res.status(404).send('Booking not found');
            }

            // Sort days
            if (customTrip.days) {
                customTrip.days.sort((a, b) => a.day_number - b.day_number);
            }

            const Destination = CustomTrip.associations.destination.target;
            const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
            const packages = await this.bookingRepo.Package.findAll({ order: [['name', 'ASC']] });

            // Fetch all customers for the dropdown
            const customers = await this.bookingRepo.Customer.findAll({
                include: [{ 
                    model: User, 
                    as: 'user',
                    where: { type: 'customer' }
                }],
                order: [[{ model: User, as: 'user' }, 'name', 'ASC']]
            });

            // Mock booking object
            const booking = {
                id: customTrip.id,
                booking_reference: 'PT-BKB' + String(customTrip.id).padStart(5, '0'),
                type: 'custom_trip',
                total_amount: customTrip.total_price,
                payment_status: 'pending',
                created_at: customTrip.created_at,
                updated_at: customTrip.updated_at,
                customer: customTrip.customer,
                custom_trip: customTrip
            };

            return res.render('admin/bookings/builder', {
                title: 'Edit Custom Booking',
                booking,
                customers,
                destinations,
                packages,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error fetching booking for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async update(req, res) {
        try {
            const CustomTrip = this.bookingRepo.CustomTrip;
            const customTrip = await CustomTrip.findByPk(req.params.id);
            if (!customTrip) {
                return res.status(404).send('Booking not found');
            }

            const { customer_id, booking_status, total_amount } = req.body;
            const oldBookingStatus = customTrip.status === 'booked' ? 'confirmed' : customTrip.status;

            const dbStatus = booking_status === 'confirmed' ? 'booked' : booking_status;

            await customTrip.update({
                customer_id,
                status: dbStatus,
                total_price: total_amount
            });

            const bookingRef = 'PT-BKB' + String(customTrip.id).padStart(5, '0');

            // Trigger ledger entry if status changes to confirmed
            if (oldBookingStatus !== 'confirmed' && booking_status === 'confirmed') {
                await this.accountingService.recordConfirmedBooking(
                    customTrip.id, 
                    bookingRef, 
                    total_amount, 
                    req.session.user ? req.session.user.id : null
                );
            }

            res.redirect(`/admin/bookings/${customTrip.id}`);
        } catch (error) {
            console.error('Error updating booking:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AdminBookingController;
