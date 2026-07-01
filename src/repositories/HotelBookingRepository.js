class HotelBookingRepository {
    constructor(HotelBooking, Hotel, User, Customer, Destination) {
        this.HotelBooking = HotelBooking;
        this.Hotel = Hotel;
        this.User = User;
        this.Customer = Customer;
        this.Destination = Destination;
    }

    parsePositiveInt(value, fallback = null) {
        const parsed = parseInt(value, 10);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
    }

    parseAmount(value, fallback = 0) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    clampPercent(value) {
        const parsed = this.parseAmount(value, 0);
        return Math.min(Math.max(parsed, 0), 100);
    }

    includes() {
        return [
            {
                model: this.User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone_number'],
                required: false
            },
            {
                model: this.Customer,
                as: 'customer',
                required: false,
                include: [{ model: this.User, as: 'user', attributes: ['id', 'name', 'email', 'phone_number'], required: false }]
            },
            {
                model: this.Hotel,
                as: 'hotel',
                required: false,
                include: [{ model: this.Destination, as: 'destination', attributes: ['id', 'name', 'slug', 'country', 'state'], required: false }]
            },
            {
                model: this.Destination,
                as: 'destination',
                attributes: ['id', 'name', 'slug', 'country', 'state'],
                required: false
            }
        ];
    }

    async resolveCustomer(userId, phone = null) {
        if (!userId || !this.Customer) return null;

        let customer = await this.Customer.findOne({ where: { user_id: userId } });
        if (!customer) {
            customer = await this.Customer.create({
                user_id: userId,
                phone: phone || null
            });
        }

        return customer;
    }

    async createFromRequest(body = {}, authUser = null) {
        const userId = authUser && authUser.id
            ? authUser.id
            : String(body.user_id || body.userId || '').trim();
        const hotelId = this.parsePositiveInt(body.hotel_id || body.hotelId);
        const rawRooms = body.room_count || body.roomCount || body.rooms_count || body.rooms;
        const roomCount = Array.isArray(rawRooms) ? rawRooms.length : this.parsePositiveInt(rawRooms);

        if (!userId) {
            const error = new Error('user_id is required');
            error.statusCode = 400;
            throw error;
        }

        if (!hotelId) {
            const error = new Error('hotel_id is required');
            error.statusCode = 400;
            throw error;
        }

        if (!roomCount) {
            const error = new Error('room_count is required and must be greater than 0');
            error.statusCode = 400;
            throw error;
        }

        const user = await this.User.findByPk(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const hotel = await this.Hotel.findByPk(hotelId, {
            include: [{ model: this.Destination, as: 'destination', required: false }]
        });
        if (!hotel) {
            const error = new Error('Hotel not found');
            error.statusCode = 404;
            throw error;
        }

        const userPlain = user.get({ plain: true });
        const hotelPlain = hotel.get({ plain: true });
        const destination = hotelPlain.destination || null;
        const customer = await this.resolveCustomer(userPlain.id, body.phone || userPlain.phone_number);
        const rooms = Array.isArray(body.rooms)
            ? body.rooms
            : [{
                room_count: roomCount,
                adults: this.parsePositiveInt(body.adults, null),
                children: this.parsePositiveInt(body.children, 0)
            }];
        const baseAmount = this.parseAmount(hotelPlain.price_per_night, 0) * roomCount;
        const commissionPercent = this.clampPercent(hotelPlain.commission_percent);
        const commissionAmount = parseFloat(((baseAmount * commissionPercent) / 100).toFixed(2));
        const totalAmount = parseFloat((baseAmount + commissionAmount).toFixed(2));
        const rawPayload = {
            user_id: userPlain.id,
            hotel_id: hotelPlain.id,
            hotel_name: hotelPlain.name,
            room_count: roomCount,
            rooms,
            notes: body.notes || null,
            phone: body.phone || null,
            check_in: body.check_in || body.checkIn || null,
            check_out: body.check_out || body.checkOut || null,
            adults: body.adults || null,
            children: body.children || null,
            total_travellers: body.total_travellers || body.totalTravellers || null,
            commission_percent: commissionPercent
        };

        return this.HotelBooking.create({
            user_id: userPlain.id,
            customer_id: customer ? customer.id : null,
            hotel_id: hotelPlain.id,
            destination_id: destination ? destination.id : hotelPlain.destination_id,
            room_count: roomCount,
            rooms,
            check_in: body.check_in || body.checkIn || null,
            check_out: body.check_out || body.checkOut || null,
            total_travellers: this.parsePositiveInt(body.total_travellers || body.totalTravellers, 1),
            base_amount: baseAmount.toFixed(2),
            commission_percent: commissionPercent.toFixed(2),
            commission_amount: commissionAmount.toFixed(2),
            total_amount: totalAmount.toFixed(2),
            status: 'new',
            notes: body.notes || null,
            raw_payload: rawPayload
        });
    }

    async findPaginated({ page = 1, limit = 10, search = '', status = '' } = {}) {
        const Op = this.HotelBooking.sequelize.Sequelize.Op;
        const sequelize = this.HotelBooking.sequelize;
        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
        const where = {};

        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { notes: { [Op.iLike]: `%${search}%` } },
                sequelize.where(sequelize.cast(sequelize.col('HotelBooking.raw_payload'), 'TEXT'), { [Op.iLike]: `%${search}%` }),
                { '$user.name$': { [Op.iLike]: `%${search}%` } },
                { '$user.email$': { [Op.iLike]: `%${search}%` } },
                { '$hotel.name$': { [Op.iLike]: `%${search}%` } },
                { '$destination.name$': { [Op.iLike]: `%${search}%` } }
            ];
        }

        return this.HotelBooking.findAndCountAll({
            where,
            include: this.includes(),
            distinct: true,
            subQuery: false,
            limit: parsedLimit,
            offset: (parsedPage - 1) * parsedLimit,
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return this.HotelBooking.findByPk(id, { include: this.includes() });
    }

    async updateStatus(id, status, notes = null, transaction = null) {
        const booking = await this.HotelBooking.findByPk(id, { transaction });
        if (!booking) return null;
        const update = { status };
        if (notes !== null) update.notes = notes;
        return booking.update(update, { transaction });
    }

    async countByStatus() {
        return this.HotelBooking.findAll({
            attributes: [
                'status',
                [this.HotelBooking.sequelize.fn('COUNT', this.HotelBooking.sequelize.col('status')), 'count']
            ],
            group: ['status'],
            raw: true
        });
    }
}

module.exports = HotelBookingRepository;
