class TripInquiryRepository {
    constructor(TripInquiry, Destination, Customer = null, User = null, Media = null) {
        this.TripInquiry = TripInquiry;
        this.Destination = Destination;
        this.Customer = Customer;
        this.User = User;
        this.Media = Media;
    }

    async create(data) {
        return await this.TripInquiry.create(data);
    }

    async findById(id) {
        const inquiry = await this.TripInquiry.findByPk(id, {
            include: [{ model: this.Destination, as: 'destination_info', required: false }]
        });

        if (!inquiry) return null;

        let row = inquiry.toJSON ? inquiry.toJSON() : { ...inquiry.dataValues };

        const destId = row.destination_id;
        const cityIds = Array.isArray(row.cities) 
            ? row.cities.map(c => c.id).filter(cid => cid !== null && cid !== undefined) 
            : [];
        
        const allEntityIds = [...new Set([destId, ...cityIds].filter(Boolean))];

        let galleryMap = {};
        if (allEntityIds.length > 0 && this.Media) {
            const Op = this.TripInquiry.sequelize.Sequelize.Op;
            const mediaRows = await this.Media.findAll({
                where: {
                    entity_type: 'destination',
                    entity_id: { [Op.in]: allEntityIds }
                },
                attributes: ['id', 'entity_id', 'url', 'alt_text', 'label', 'is_primary', 'media_type'],
                order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
            });
            
            mediaRows.forEach(m => {
                const eid = m.entity_id;
                if (!galleryMap[eid]) galleryMap[eid] = [];
                galleryMap[eid].push({
                    id: m.id,
                    url: m.url,
                    alt_text: m.alt_text,
                    label: m.label,
                    is_primary: m.is_primary,
                    media_type: m.media_type
                });
            });
        }

        let destGallery = [];
        if (row.destination_info && row.destination_info.feature_image) {
            destGallery.push({
                id: 'feature',
                url: row.destination_info.feature_image,
                alt_text: row.destination_info.feature_image_alt || '',
                is_primary: true
            });
        }
        if (destId && galleryMap[destId]) {
            destGallery = destGallery.concat(galleryMap[destId]);
        }

        const addedIds = new Set(destGallery.map(g => g.id));
        if (Array.isArray(row.cities)) {
            for (const city of row.cities) {
                if (city.id && galleryMap[city.id]) {
                    for (const media of galleryMap[city.id]) {
                        if (!addedIds.has(media.id)) {
                            destGallery.push(media);
                            addedIds.add(media.id);
                        }
                    }
                }
            }
        }

        row.destination_gallery = destGallery;

        return row;
    }

    async findModelById(id) {
        return await this.TripInquiry.findByPk(id);
    }

    parseAmount(value) {
        const amount = parseFloat(value);
        return Number.isFinite(amount) ? amount : 0;
    }

    getCityNights(city = {}) {
        const explicitNights = [
            city.nights,
            city.night,
            city.stay_nights,
            city.duration_nights
        ].find(value => value !== undefined && value !== null && value !== '');

        if (explicitNights !== undefined) {
            const parsed = parseInt(explicitNights, 10);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
        }

        if (Array.isArray(city.activities) && city.activities.length > 0) {
            return city.activities.length;
        }

        return 1;
    }

    async calculateDestinationAmount(inquiry = {}) {
        const cities = Array.isArray(inquiry.cities) ? inquiry.cities : [];
        const destinationIds = [...new Set(
            cities
                .map(city => city.id || city.destination_id)
                .concat(inquiry.destination_id || [])
                .filter(id => id !== null && id !== undefined && id !== '')
        )];

        const destinationMap = {};
        if (destinationIds.length > 0) {
            const Op = this.TripInquiry.sequelize.Sequelize.Op;
            const destinations = await this.Destination.findAll({
                where: { id: { [Op.in]: destinationIds } },
                attributes: ['id', 'name', 'gst_amount']
            });

            destinations.forEach(destination => {
                const row = destination.toJSON ? destination.toJSON() : destination;
                destinationMap[row.id] = row;
            });
        }

        const rows = (cities.length ? cities : [{ id: inquiry.destination_id, name: inquiry.destination }]).map(city => {
            const destinationId = city.id || city.destination_id || inquiry.destination_id;
            const destination = destinationMap[destinationId] || {};
            const rate = this.parseAmount(
                city.destination_amount !== undefined
                    ? city.destination_amount
                    : (city.gst_amount !== undefined ? city.gst_amount : destination.gst_amount)
            );
            const nights = this.getCityNights(city);
            const total = parseFloat((rate * nights).toFixed(2));

            return {
                destination_id: destinationId || null,
                name: city.name || destination.name || inquiry.destination || 'Destination',
                nights,
                rate,
                total
            };
        }).filter(row => row.rate > 0 || row.nights > 0);

        const total = parseFloat(rows.reduce((sum, row) => sum + row.total, 0).toFixed(2));
        return { rows, total };
    }

    /**
     * Find inquiry by ID and enrich each city with gallery images from the media table.
     * Gallery is fetched using city.id (destination_id) where entity_type = 'destination'.
     */
    async findByIdWithGallery(id) {
        const inquiry = await this.TripInquiry.findByPk(id, {
            include: [{ model: this.Destination, as: 'destination_info', required: false }]
        });
        if (!inquiry) return null;

        const plain = inquiry.toJSON ? inquiry.toJSON() : { ...inquiry.dataValues };

        // Enrich cities with gallery
        if (Array.isArray(plain.cities) && plain.cities.length > 0 && this.Media) {
            const destIds = plain.cities
                .map(c => c.id)
                .filter(id => id !== undefined && id !== null);

            let galleryMap = {};
            if (destIds.length > 0) {
                const Op = this.TripInquiry.sequelize.Sequelize.Op;
                const mediaRows = await this.Media.findAll({
                    where: {
                        entity_type: 'destination',
                        entity_id: { [Op.in]: destIds },
                        media_type: 'image'
                    },
                    attributes: ['id', 'entity_id', 'url', 'alt_text', 'label', 'is_primary'],
                    order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
                });
                mediaRows.forEach(m => {
                    const eid = m.entity_id;
                    if (!galleryMap[eid]) galleryMap[eid] = [];
                    galleryMap[eid].push({
                        id: m.id,
                        url: m.url,
                        alt_text: m.alt_text,
                        label: m.label,
                        is_primary: m.is_primary
                    });
                });
            }

            plain.cities = plain.cities.map(city => ({
                ...city,
                gallery: galleryMap[city.id] || []
            }));
        }

        // Also fetch feature image from destination_info
        if (plain.destination_info) {
            plain.destination_gallery = plain.destination_info.feature_image
                ? [{ url: plain.destination_info.feature_image, alt_text: plain.destination_info.feature_image_alt, is_primary: true }]
                : [];
        }

        return plain;
    }

    buildSourceWhere(source = '') {
        const normalizedSource = String(source || '').trim();
        if (!normalizedSource) return null;

        if (normalizedSource === 'custom') {
            return { [this.TripInquiry.sequelize.Sequelize.Op.ne]: 'hotel_booking' };
        }

        return normalizedSource;
    }

    async findPaginated(page = 1, limit = 20, search = '', status = '', source = '') {
        const Op = this.TripInquiry.sequelize.Sequelize.Op;
        
        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);
        const offset = (parsedPage - 1) * parsedLimit;
        const where = {};
        const sourceWhere = this.buildSourceWhere(source);

        if (status) where.status = status;
        if (sourceWhere) where.source = sourceWhere;

        if (search) {
            const sequelize = this.TripInquiry.sequelize;
            where[Op.or] = [
                { customer_name: { [Op.iLike]: `%${search}%` } },
                { customer_email: { [Op.iLike]: `%${search}%` } },
                { customer_phone: { [Op.iLike]: `%${search}%` } },
                { destination: { [Op.iLike]: `%${search}%` } },
                { source: { [Op.iLike]: `%${search}%` } },
                { notes: { [Op.iLike]: `%${search}%` } },
                sequelize.where(
                    sequelize.cast(sequelize.col('TripInquiry.raw_payload'), 'TEXT'),
                    { [Op.iLike]: `%${search}%` }
                )
            ];
        }

        const result = await this.TripInquiry.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{ model: this.Destination, as: 'destination_info', required: false }]
        });

        if (result.rows.length === 0) return result;

        let plainRows = result.rows.map(r => r.toJSON ? r.toJSON() : { ...r.dataValues });

        // Collect destination IDs + all city IDs across every row
        const destIds = [...new Set(plainRows.map(r => r.destination_id).filter(id => id !== null && id !== undefined))];

        const cityIds = [...new Set(
            plainRows.flatMap(r =>
                Array.isArray(r.cities)
                    ? r.cities.map(c => c.id).filter(id => id !== null && id !== undefined)
                    : []
            )
        )];

        // Merge both sets so we fetch all media in one query
        const allEntityIds = [...new Set([...destIds, ...cityIds])];

        let galleryMap = {};
        if (allEntityIds.length > 0 && this.Media) {
            const mediaRows = await this.Media.findAll({
                where: {
                    entity_type: 'destination',
                    entity_id: { [Op.in]: allEntityIds }
                },
                attributes: ['id', 'entity_id', 'url', 'alt_text', 'label', 'is_primary', 'media_type'],
                order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
            });
            
            mediaRows.forEach(m => {
                const eid = m.entity_id;
                if (!galleryMap[eid]) galleryMap[eid] = [];
                galleryMap[eid].push({
                    id: m.id,
                    url: m.url,
                    alt_text: m.alt_text,
                    label: m.label,
                    is_primary: m.is_primary,
                    media_type: m.media_type
                });
            });
        }

        plainRows = plainRows.map(row => {
            const destId = row.destination_id;

            // ── destination_gallery: feature image + destination media + all city media ──
            let destGallery = [];
            if (row.destination_info && row.destination_info.feature_image) {
                destGallery.push({
                    id: 'feature',
                    url: row.destination_info.feature_image,
                    alt_text: row.destination_info.feature_image_alt || '',
                    is_primary: true
                });
            }
            if (destId && galleryMap[destId]) {
                destGallery = destGallery.concat(galleryMap[destId]);
            }

            // Merge media from all cities into destination_gallery
            const addedIds = new Set(destGallery.map(g => g.id));
            if (Array.isArray(row.cities)) {
                for (const city of row.cities) {
                    if (city.id && galleryMap[city.id]) {
                        for (const media of galleryMap[city.id]) {
                            if (!addedIds.has(media.id)) {
                                destGallery.push(media);
                                addedIds.add(media.id);
                            }
                        }
                    }
                }
            }

            row.destination_gallery = destGallery;

            delete row.destination_info;
            return row;
        });

        return { count: result.count, rows: plainRows };
    }

    async updateStatus(id, status, notes = null) {
        const inquiry = await this.TripInquiry.findByPk(id);
        if (!inquiry) return null;
        const update = { status };
        if (notes !== null) update.notes = notes;
        return await inquiry.update(update);
    }

    async setPrice(id, basePrice) {
        const inquiry = await this.TripInquiry.findByPk(id, {
            include: [{ model: this.Destination, as: 'destination_info', required: false }]
        });
        if (!inquiry) return null;

        const base = parseFloat(basePrice) || 0;
        const destinationPricing = await this.calculateDestinationAmount(
            inquiry.toJSON ? inquiry.toJSON() : inquiry
        );
        const destinationAmount = destinationPricing.total;

        const tcsAmount = 0.00;
        const totalAmount = parseFloat((base + destinationAmount + tcsAmount).toFixed(2));

        return await inquiry.update({
            base_price:   base,
            gst_amount:   destinationAmount,
            tcs_amount:   tcsAmount,
            total_amount: totalAmount,
            tcs_rate:     0.00
        });
    }

    async findDestinationBySlug(slug) {
        return await this.Destination.findOne({ where: { slug } });
    }

    async findDestinationById(id) {
        return await this.Destination.findByPk(id);
    }

    async countByStatus(source = '') {
        const where = {};
        const sourceWhere = this.buildSourceWhere(source);
        if (sourceWhere) where.source = sourceWhere;

        return await this.TripInquiry.findAll({
            attributes: [
                'status',
                [this.TripInquiry.sequelize.fn('COUNT', this.TripInquiry.sequelize.col('status')), 'count']
            ],
            where,
            group: ['status'],
            raw: true
        });
    }

    async countBySource() {
        const rows = await this.TripInquiry.findAll({
            attributes: [
                'source',
                [this.TripInquiry.sequelize.fn('COUNT', this.TripInquiry.sequelize.col('source')), 'count']
            ],
            group: ['source'],
            raw: true
        });

        const counts = rows.reduce((acc, item) => {
            const source = item.source || 'unknown';
            const count = parseInt(item.count, 10);
            acc[source] = count;
            acc.total += count;
            if (source === 'hotel_booking') acc.hotel_booking += count;
            else acc.custom += count;
            return acc;
        }, { total: 0, custom: 0, hotel_booking: 0 });

        return counts;
    }

    async resolveCustomerId(customer = {}) {
        if (!this.Customer || !customer) return null;

        const isUuid = (value) => (
            typeof value === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
        );

        if (isUuid(customer.id)) {
            const byCustomerId = await this.Customer.findByPk(customer.id);
            if (byCustomerId) return byCustomerId.id;

            const byUserId = await this.Customer.findOne({ where: { user_id: customer.id } });
            if (byUserId) return byUserId.id;
        }

        if (this.User && customer.email) {
            const user = await this.User.findOne({ where: { email: customer.email } });
            if (!user) return null;

            let profile = await this.Customer.findOne({ where: { user_id: user.id } });
            if (!profile) {
                profile = await this.Customer.create({
                    user_id: user.id,
                    phone: customer.phone || null
                });
            }

            return profile.id;
        }

        return null;
    }
}

module.exports = TripInquiryRepository;
