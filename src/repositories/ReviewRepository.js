const BaseRepository = require('./BaseRepository');
const { Op } = require('sequelize');

class ReviewRepository extends BaseRepository {
    constructor(Review, Media, Package, CustomTrip, Customer, User, TripInquiry = null) {
        super(Review);
        this.Review = Review;
        this.Media = Media;
        this.Package = Package;
        this.CustomTrip = CustomTrip;
        this.Customer = Customer;
        this.User = User;
        this.TripInquiry = TripInquiry;
    }

    normalizeReviewableType(type) {
        const value = String(type || '').trim().toLowerCase();
        if (['package', 'packages'].includes(value)) return 'package';
        if (['custom_booking', 'custom-booking', 'custom_booking', 'custom-trip', 'custom_trip', 'booking'].includes(value)) {
            return 'custom_booking';
        }
        if (['custom_package', 'custom-package', 'customize_package', 'customized_package', 'custom-inquiry', 'custom_inquiry', 'trip-inquiry', 'trip_inquiry', 'inquiry'].includes(value)) {
            return 'custom_package';
        }
        return null;
    }

    buildTargetWhere(type, id) {
        const reviewableType = this.normalizeReviewableType(type);
        if (!reviewableType || !id) return null;

        if (reviewableType === 'custom_package') {
            const inquiryId = String(id || '').trim();
            if (!inquiryId) return null;
            return { reviewable_type: reviewableType, trip_inquiry_id: inquiryId };
        }

        const numericId = parseInt(id, 10);
        if (!Number.isInteger(numericId) || numericId <= 0) return null;

        if (reviewableType === 'package') {
            return { reviewable_type: reviewableType, reviewable_id: numericId, package_id: numericId };
        }

        return { reviewable_type: reviewableType, reviewable_id: numericId, custom_trip_id: numericId };
    }

    includeOptions() {
        return [
            {
                model: this.Media,
                as: 'media',
                required: false,
                separate: true,
                order: [
                    ['is_primary', 'DESC'],
                    ['id', 'ASC']
                ]
            },
            {
                model: this.Package,
                as: 'package',
                required: false,
                attributes: ['id', 'name', 'slug', 'main_image', 'main_image_alt', 'price', 'duration_days']
            },
            {
                model: this.CustomTrip,
                as: 'custom_booking',
                required: false,
                include: [
                    { association: 'destination', required: false },
                    {
                        association: 'customer',
                        required: false,
                        include: [{ association: 'user', attributes: ['id', 'name', 'email'] }]
                    }
                ]
            },
            ...(this.TripInquiry ? [{
                model: this.TripInquiry,
                as: 'custom_package',
                required: false,
                attributes: [
                    'id',
                    'customer_name',
                    'customer_email',
                    'customer_phone',
                    'destination',
                    'destination_slug',
                    'duration',
                    'status',
                    'total_amount'
                ],
                include: [{
                    association: 'destination_info',
                    required: false,
                    attributes: ['id', 'name', 'slug', 'feature_image', 'feature_image_alt']
                }]
            }] : []),
            {
                model: this.Customer,
                as: 'customer',
                required: false,
                include: [{ model: this.User, as: 'user', attributes: ['id', 'name', 'email'] }]
            }
        ];
    }

    async targetExists(type, id) {
        const reviewableType = this.normalizeReviewableType(type);
        if (!reviewableType) return false;

        if (reviewableType === 'custom_package') {
            const inquiryId = String(id || '').trim();
            return !!(this.TripInquiry && inquiryId && await this.TripInquiry.findByPk(inquiryId));
        }

        const numericId = parseInt(id, 10);
        if (!Number.isInteger(numericId) || numericId <= 0) return false;

        if (reviewableType === 'package') {
            return !!(await this.Package.findByPk(numericId));
        }

        return !!(await this.CustomTrip.findByPk(numericId));
    }

    async createWithMedia(data, mediaItems = []) {
        const transaction = await this.Review.sequelize.transaction();
        try {
            const review = await this.Review.create(data, { transaction });

            if (mediaItems.length > 0) {
                await this.Media.bulkCreate(
                    mediaItems.map((item, index) => ({
                        entity_type: 'review',
                        entity_id: review.id,
                        url: item.url,
                        alt_text: item.alt_text || item.altText || null,
                        media_type: item.media_type || item.mediaType || 'image',
                        key: item.key || null,
                        label: item.label || null,
                        poster_url: item.poster_url || item.posterUrl || null,
                        is_primary: item.is_primary !== undefined ? !!item.is_primary : index === 0
                    })),
                    { transaction }
                );
            }

            await transaction.commit();
            return this.findById(review.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findById(id) {
        return this.Review.findByPk(id, {
            include: this.includeOptions()
        });
    }

    async findPackageBySlug(slug) {
        const value = String(slug || '').trim();
        if (!value) return null;

        return this.Package.findOne({
            where: { slug: value },
            attributes: ['id', 'name', 'slug', 'main_image', 'main_image_alt', 'price', 'duration_days']
        });
    }

    async findPackageById(id) {
        const numericId = parseInt(id, 10);
        if (!Number.isInteger(numericId) || numericId <= 0) return null;

        return this.Package.findByPk(numericId, {
            attributes: ['id', 'name', 'slug', 'main_image', 'main_image_alt', 'price', 'duration_days']
        });
    }

    async findCustomPackageByInquiryId(id) {
        const inquiryId = String(id || '').trim();
        if (!this.TripInquiry || !inquiryId) return null;

        return this.TripInquiry.findByPk(inquiryId, {
            include: [{ association: 'destination_info', required: false }]
        });
    }

    async findAllWithFilters(filters = {}) {
        const where = {};
        const reviewableType = this.normalizeReviewableType(filters.reviewable_type || filters.type);

        if (reviewableType) where.reviewable_type = reviewableType;
        if (filters.reviewable_id) where.reviewable_id = parseInt(filters.reviewable_id, 10);
        if (filters.package_id) where.package_id = parseInt(filters.package_id, 10);
        if (filters.custom_trip_id || filters.custom_booking_id) {
            where.custom_trip_id = parseInt(filters.custom_trip_id || filters.custom_booking_id, 10);
        }
        if (filters.trip_inquiry_id || filters.inquiry_id || filters.custom_package_id) {
            where.trip_inquiry_id = String(filters.trip_inquiry_id || filters.inquiry_id || filters.custom_package_id).trim();
        }
        if (filters.customer_id) where.customer_id = filters.customer_id;
        if (filters.status && filters.status !== 'all') where.status = filters.status;
        if (!filters.status) where.status = 'approved';

        const limit = Math.min(parseInt(filters.limit, 10) || 20, 100);
        const page = Math.max(parseInt(filters.page, 10) || 1, 1);
        const offset = (page - 1) * limit;

        return this.Review.findAndCountAll({
            where,
            include: this.includeOptions(),
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    async findForTarget(type, id, filters = {}) {
        const targetWhere = this.buildTargetWhere(type, id);
        if (!targetWhere) return { rows: [], count: 0 };

        const where = { reviewable_type: targetWhere.reviewable_type };
        if (targetWhere.reviewable_type === 'package') {
            where[Op.or] = [
                { reviewable_id: targetWhere.reviewable_id },
                { package_id: targetWhere.package_id }
            ];
        } else if (targetWhere.reviewable_type === 'custom_package') {
            where.trip_inquiry_id = targetWhere.trip_inquiry_id;
        } else {
            where.reviewable_id = targetWhere.reviewable_id;
        }
        if (filters.status && filters.status !== 'all') where.status = filters.status;
        if (!filters.status) where.status = 'approved';

        return this.Review.findAndCountAll({
            where,
            include: this.includeOptions(),
            distinct: true,
            order: [['created_at', 'DESC']]
        });
    }

    async summaryForTarget(type, id) {
        const targetWhere = this.buildTargetWhere(type, id);
        if (!targetWhere) return { count: 0, average_rating: 0 };

        const where = {
            reviewable_type: targetWhere.reviewable_type,
            status: 'approved'
        };

        if (targetWhere.reviewable_type === 'package') {
            where[Op.or] = [
                { reviewable_id: targetWhere.reviewable_id },
                { package_id: targetWhere.package_id }
            ];
        } else if (targetWhere.reviewable_type === 'custom_package') {
            where.trip_inquiry_id = targetWhere.trip_inquiry_id;
        } else {
            where.reviewable_id = targetWhere.reviewable_id;
        }

        const rows = await this.Review.findAll({
            where,
            attributes: ['rating']
        });

        if (!rows.length) return { count: 0, average_rating: 0 };

        const total = rows.reduce((sum, row) => sum + (parseInt(row.rating, 10) || 0), 0);
        return {
            count: rows.length,
            average_rating: Number((total / rows.length).toFixed(1))
        };
    }
}

module.exports = ReviewRepository;
