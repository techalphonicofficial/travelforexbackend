class AdminProviderController {
    constructor(models = {}) {
        this.ProviderConfig = models.ProviderConfig;
    }

    async index(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const providers = await this.ProviderConfig.findAll({
                order: [['created_at', 'DESC']]
            });

            return res.render('admin/providers/index', {
                title: 'API Providers',
                providers: providers.map((row) =>
                    row.get
                        ? row.get({ plain: true })
                        : row
                ),
                success: req.query.success || '',
                error: req.query.error || '',
                user: req.session.user
            });

        } catch (error) {
            console.error(
                'Admin provider index error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async tripjackBookings(req, res) {
        try {
            return res.render('admin/tripjack-bookings/index', {
                title: 'TripJack Bookings',
                adminUser: req.session.user,
                user: req.session.user
            });
        } catch (error) {
            console.error('Admin TripJack bookings error:', error);

            return res.status(500).send('Internal Server Error');
        }
    }

    async create(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const {
                provider_name,
                api_key,
                hotel_url,
                hotel_book_url,
                flight_url,
                environment
            } = req.body;

            if (
                !provider_name ||
                !api_key ||
                !hotel_url ||
                !hotel_book_url ||
                !flight_url ||
                !environment
            ) {
                return res
                    .status(400)
                    .send('All fields are required');
            }

            if (
                !['TEST', 'PRODUCTION'].includes(
                    String(environment).toUpperCase()
                )
            ) {
                return res
                    .status(400)
                    .send('Invalid environment');
            }

            const now = new Date();

            await this.ProviderConfig.create({
                provider_name: provider_name.trim(),
                api_key: api_key.trim(),
                hotel_url: hotel_url.trim(),
                hotel_book_url: hotel_book_url.trim(),
                flight_url: flight_url.trim(),
                environment:
                    String(environment).toUpperCase(),
                created_at: now,
                updated_at: now
            });

            return res.redirect(
                '/admin/providers?success=Provider created successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider create error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async update(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const provider =
                await this.ProviderConfig.findByPk(
                    req.params.id
                );

            if (!provider) {
                return res
                    .status(404)
                    .send('Provider configuration not found');
            }

            const {
                provider_name,
                api_key,
                hotel_url,
                hotel_book_url,
                flight_url,
                environment
            } = req.body;

            if (
                !provider_name ||
                !hotel_url ||
                !hotel_book_url ||
                !flight_url ||
                !environment
            ) {
                return res
                    .status(400)
                    .send('Required fields are missing');
            }

            if (
                !['TEST', 'PRODUCTION'].includes(
                    String(environment).toUpperCase()
                )
            ) {
                return res
                    .status(400)
                    .send('Invalid environment');
            }

            const updateData = {
                provider_name: provider_name.trim(),
                hotel_url: hotel_url.trim(),
                hotel_book_url: hotel_book_url.trim(),
                flight_url: flight_url.trim(),
                environment:
                    String(environment).toUpperCase(),
                updated_at: new Date()
            };

            // Update API key only when a new key is provided
            if (api_key && api_key.trim()) {
                updateData.api_key = api_key.trim();
            }

            await provider.update(updateData);

            return res.redirect(
                '/admin/providers?success=Provider updated successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider update error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async delete(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const provider =
                await this.ProviderConfig.findByPk(
                    req.params.id
                );

            if (!provider) {
                return res
                    .status(404)
                    .send('Provider configuration not found');
            }

            await provider.destroy();

            return res.redirect(
                '/admin/providers?success=Provider deleted successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider delete error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }
    /* =========================================================
       SUPPLIER (TRIPJACK) BOOKINGS: admin data + actions
       Admin session + "TripJack Bookings" permission protect
       every route under /admin/providers/tripjack-bookings.
    ========================================================= */

    static plain(row) {
        return row && row.get ? row.get({ plain: true }) : row;
    }

    static refundTotals(booking) {
        const refunds = Array.isArray(booking?.booking_data?.refunds) ? booking.booking_data.refunds : [];
        const counted = refunds.filter((r) => ['SUCCESS', 'PROCESSING', 'MANUAL'].includes(r.status));
        const refunded = counted.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const paid = ['SUCCESS', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(booking?.payment_status)
            ? Number(booking.amount || 0)
            : 0;
        return {
            paid,
            refunded: Math.round(refunded * 100) / 100,
            refundable: Math.max(0, Math.round((paid - refunded) * 100) / 100)
        };
    }

    /*
     * Accounts that made the bookings (users + customer profile), by user id.
     * withStats adds how many bookings each account has.
     */
    static async loadAccounts(userIds, { withStats = false } = {}) {
        const ids = [...new Set((userIds || []).filter(Boolean).map(String))];
        const accounts = new Map();
        if (!ids.length) return accounts;

        const { Op, fn, col } = require('sequelize');
        const User = require('../models/User');
        const Customer = require('../models/Customer');
        const Booking = require('../models/Booking');

        const [users, profiles, counts] = await Promise.all([
            User.findAll({
                where: { id: { [Op.in]: ids } },
                attributes: ['id', 'name', 'email', 'phone_number', 'type', 'status', 'created_at']
            }),
            Customer.findAll({
                where: { user_id: { [Op.in]: ids } },
                attributes: ['user_id', 'phone', 'city', 'state']
            }).catch(() => []),
            withStats
                ? Booking.findAll({
                    where: { user_id: { [Op.in]: ids } },
                    attributes: ['user_id', 'status', [fn('COUNT', col('id')), 'count']],
                    group: ['user_id', 'status'],
                    raw: true
                })
                : []
        ]);

        const profileOf = new Map(profiles.map((p) => [String(p.user_id), p]));
        users.forEach((user) => {
            const profile = profileOf.get(String(user.id));
            const rows = counts.filter((c) => String(c.user_id) === String(user.id));
            accounts.set(String(user.id), {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone_number || profile?.phone || null,
                type: user.type,
                active: user.status !== false,
                memberSince: user.created_at,
                city: [profile?.city, profile?.state].filter(Boolean).join(', ') || null,
                ...(withStats && {
                    bookings: rows.reduce((sum, c) => sum + Number(c.count), 0),
                    confirmedBookings: rows.filter((c) => c.status === 'BOOKED').reduce((sum, c) => sum + Number(c.count), 0)
                })
            });
        });
        return accounts;
    }

    // GET /admin/providers/tripjack-bookings/data
    async tripjackBookingsData(req, res) {
        try {
            const { Op, literal, where: sqlWhere } = require('sequelize');
            const Booking = require('../models/Booking');

            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
            const type = String(req.query.type || 'ALL').toUpperCase();
            const status = String(req.query.status || '').toUpperCase();
            const q = String(req.query.q || '').trim().slice(0, 60);

            const where = {};
            const and = [];
            if (['HOTEL', 'FLIGHT'].includes(type)) where.booking_type = type;
            if (status === 'ACTION') {
                and.push({
                    [Op.or]: [
                        { status: 'BOOKING_FAILED' },
                        sqlWhere(literal(`booking_data->>'refundRequired'`), 'true'),
                        sqlWhere(literal(`booking_data->>'needsManualReview'`), 'true')
                    ]
                });
            } else if (status) {
                where.status = status;
            }
            if (q) {
                and.push({
                    [Op.or]: [
                        { booking_reference: { [Op.iLike]: `%${q}%` } },
                        { provider_reference: { [Op.iLike]: `%${q}%` } },
                        { provider_booking_id: { [Op.iLike]: `%${q}%` } },
                        sqlWhere(literal(`booking_data->'contact'->>'email'`), { [Op.iLike]: `%${q}%` }),
                        sqlWhere(literal(`booking_data->'contact'->>'mobile'`), { [Op.iLike]: `%${q}%` }),
                        // account that made the booking (name / email / phone)
                        literal(`"Booking"."user_id"::text IN (SELECT id::text FROM users WHERE name ILIKE ${Booking.sequelize.escape(`%${q}%`)} OR email ILIKE ${Booking.sequelize.escape(`%${q}%`)} OR phone_number ILIKE ${Booking.sequelize.escape(`%${q}%`)})`)
                    ]
                });
            }
            if (and.length) where[Op.and] = and;

            const { count, rows } = await Booking.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                limit,
                offset: (page - 1) * limit
            });

            const actionCount = await Booking.count({
                where: {
                    [Op.or]: [
                        { status: 'BOOKING_FAILED' },
                        sqlWhere(literal(`booking_data->>'refundRequired'`), 'true'),
                        sqlWhere(literal(`booking_data->>'needsManualReview'`), 'true')
                    ]
                }
            });

            const accounts = await AdminProviderController.loadAccounts(rows.map((row) => row.user_id)).catch((error) => {
                console.error('Admin bookings account lookup failed:', error.message);
                return new Map();
            });

            return res.json({
                success: true,
                data: rows.map((row) => {
                    const booking = AdminProviderController.plain(row);
                    const account = accounts.get(String(booking.user_id));
                    return {
                        ...booking,
                        refundSummary: AdminProviderController.refundTotals(booking),
                        account: account ? { id: account.id, name: account.name, email: account.email, phone: account.phone } : null
                    };
                }),
                summary: { actionCount },
                pagination: {
                    currentPage: page,
                    limit,
                    totalRecords: count,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Admin supplier bookings list error:', error);
            return res.status(500).json({ success: false, message: 'Unable to load bookings' });
        }
    }

    // GET /admin/providers/tripjack-bookings/:id/details
    async tripjackBookingDetails(req, res) {
        try {
            const Booking = require('../models/Booking');
            const Payment = require('../models/Payment');

            const booking = await Booking.findByPk(req.params.id);
            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            const payments = await Payment.findAll({
                where: { booking_id: booking.id },
                order: [['created_at', 'DESC']]
            });

            let customer = null;
            try {
                const accounts = await AdminProviderController.loadAccounts([booking.user_id], { withStats: true });
                customer = accounts.get(String(booking.user_id)) || null;
            } catch (error) {
                console.error('Admin booking account lookup failed:', error.message);
                customer = null;
            }

            const plain = AdminProviderController.plain(booking);

            return res.json({
                success: true,
                data: {
                    booking: plain,
                    refundSummary: AdminProviderController.refundTotals(plain),
                    customer,
                    payments: payments.map((row) => {
                        const p = AdminProviderController.plain(row);
                        if (p.payment_data?.request) delete p.payment_data.request.secureHash;
                        return p;
                    })
                }
            });
        } catch (error) {
            console.error('Admin supplier booking details error:', error);
            return res.status(500).json({ success: false, message: 'Unable to load booking' });
        }
    }

    // POST /admin/providers/tripjack-bookings/:id/refresh
    async tripjackBookingRefresh(req, res) {
        if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }
        try {
            const container = require('../container');
            const { iciciPaymentService, bookingService } = container.services;
            const Booking = require('../models/Booking');

            let booking = await Booking.findByPk(req.params.id);
            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            if (String(booking.booking_type).toUpperCase() === 'FLIGHT' && booking.status === 'BOOKED') {
                // booked: fetch the latest PNR / e-ticket numbers from the airline
                await iciciPaymentService.syncFlightTickets(booking, { source: 'admin', force: true });
            } else if (String(booking.booking_type).toUpperCase() === 'FLIGHT' && booking.payment_status === 'SUCCESS') {
                await iciciPaymentService.reconcileFlightBooking(booking, { source: 'admin' });
            } else if (String(booking.booking_type).toUpperCase() === 'HOTEL' && iciciPaymentService.reconcileHotelBooking && booking.payment_status === 'SUCCESS') {
                await iciciPaymentService.reconcileHotelBooking(booking);
            } else if (booking.status === 'INITIATED' || booking.status === 'PAYMENT_NOT_COMPLETED') {
                const Payment = require('../models/Payment');
                const payment = await Payment.findOne({ where: { booking_id: booking.id }, order: [['created_at', 'DESC']] });
                if (payment) await iciciPaymentService.checkPaymentStatus(payment);
            }

            booking = await bookingService.findById(req.params.id);
            return res.json({ success: true, data: { status: booking.status, payment_status: booking.payment_status } });
        } catch (error) {
            console.error('Admin supplier booking refresh error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Unable to refresh status' });
        }
    }

    // POST /admin/providers/tripjack-bookings/:id/refund
    async tripjackBookingRefund(req, res) {
        if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        AdminProviderController.refundLocks = AdminProviderController.refundLocks || new Set();
        const lockKey = String(req.params.id);
        if (AdminProviderController.refundLocks.has(lockKey)) {
            return res.status(409).json({ success: false, message: 'A refund for this booking is already being processed' });
        }
        AdminProviderController.refundLocks.add(lockKey);

        try {
            const Booking = require('../models/Booking');
            const Payment = require('../models/Payment');
            const { iciciPaymentService } = require('../container').services;

            const booking = await Booking.findByPk(req.params.id);
            if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

            const method = String(req.body?.method || 'GATEWAY').toUpperCase();
            const amount = Math.round(Number(req.body?.amount) * 100) / 100;
            const reason = String(req.body?.reason || '').trim().slice(0, 300);
            const reference = String(req.body?.reference || '').trim().slice(0, 100);
            const totals = AdminProviderController.refundTotals(AdminProviderController.plain(booking));

            if (!totals.paid) return res.status(400).json({ success: false, message: 'This booking has no successful payment to refund' });
            if (!['GATEWAY', 'MANUAL'].includes(method)) return res.status(400).json({ success: false, message: 'Invalid refund method' });
            if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Enter a valid refund amount' });
            if (amount > totals.refundable) return res.status(400).json({ success: false, message: `Maximum refundable amount is ₹${totals.refundable}` });
            if (reason.length < 5) return res.status(400).json({ success: false, message: 'Enter the refund reason' });
            if (method === 'MANUAL' && !reference) return res.status(400).json({ success: false, message: 'Enter the bank / UTR reference for a manual refund' });
            if (booking.status === 'BOOKED' && req.body?.supplierCancelled !== true) {
                return res.status(400).json({ success: false, message: 'This booking is confirmed. Cancel it with the supplier first and tick the confirmation.' });
            }

            let result;
            if (method === 'GATEWAY') {
                const payment = await Payment.findOne({ where: { booking_id: booking.id, status: 'success' }, order: [['created_at', 'DESC']] });
                if (!payment) return res.status(400).json({ success: false, message: 'Successful gateway payment not found for this booking' });
                result = await iciciPaymentService.refundPayment({ payment, amount });
            } else {
                result = { status: 'MANUAL', refundTxnNo: null, gatewayRef: reference, message: 'Recorded manually' };
            }

            const admin = req.session?.user || {};
            const entry = {
                id: `R${Date.now()}`,
                amount,
                method,
                status: result.status,
                reason,
                reference: reference || null,
                refundTxnNo: result.refundTxnNo || null,
                gatewayRef: result.gatewayRef || null,
                message: result.message || null,
                supplierCancelled: req.body?.supplierCancelled === true,
                by: { id: admin.id || null, name: admin.name || null, email: admin.email || null },
                createdAt: new Date().toISOString(),
                ...(result.status === 'SUCCESS' || result.status === 'MANUAL' ? { completedAt: new Date().toISOString() } : {}),
                ...(result.response && { gatewayResponse: result.response })
            };

            const data = booking.booking_data || {};
            const refunds = [...(Array.isArray(data.refunds) ? data.refunds : []), entry];
            const after = AdminProviderController.refundTotals({ ...AdminProviderController.plain(booking), booking_data: { ...data, refunds } });
            const fullyRefunded = after.refundable <= 0;
            const counted = ['SUCCESS', 'PROCESSING', 'MANUAL'].includes(entry.status);

            await booking.update({
                ...(counted && {
                    payment_status: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                    ...(fullyRefunded && { status: booking.status === 'BOOKED' ? 'CANCELLED' : 'REFUNDED' })
                }),
                booking_data: {
                    ...data,
                    refunds,
                    ...(counted && fullyRefunded && { refundRequired: false })
                }
            });

            if (!counted) {
                return res.status(502).json({ success: false, message: `Refund was not accepted by the payment gateway${entry.message ? `: ${entry.message}` : ''}`, data: entry });
            }

            return res.json({
                success: true,
                message: entry.status === 'PROCESSING' ? 'Refund submitted to the payment gateway' : 'Refund recorded',
                data: { refund: entry, refundSummary: after }
            });
        } catch (error) {
            console.error('Admin supplier booking refund error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Unable to process refund' });
        } finally {
            AdminProviderController.refundLocks.delete(lockKey);
        }
    }
}

module.exports = AdminProviderController;
