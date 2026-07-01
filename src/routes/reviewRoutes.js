/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         reviewable_type:
 *           type: string
 *           enum: [package, custom_booking, custom_package]
 *         reviewable_id:
 *           type: integer
 *         package_id:
 *           type: integer
 *         custom_trip_id:
 *           type: integer
 *         trip_inquiry_id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         title:
 *           type: string
 *         comment:
 *           type: string
 *         reviewer_name:
 *           type: string
 *         reviewer_email:
 *           type: string
 *         reviewer_phone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         media:
 *           type: array
 *           items:
 *             type: object
 */

const express = require('express');
const router = express.Router();
const handleReviewMediaUpload = require('../middleware/reviewMediaUpload');
const { repositories: { reviewRepo } } = require('../container');

const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'];

function parseJsonMaybe(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function parseMediaUrls(body) {
    const raw = parseJsonMaybe(body.media_urls, null) || body.media_url || body.media;
    if (!raw) return [];

    const values = Array.isArray(raw) ? raw : String(raw).split(',').map(item => item.trim()).filter(Boolean);
    return values.map(item => {
        if (typeof item === 'string') {
            return {
                url: item,
                media_type: /\.(mp4|mov|avi|webm)$/i.test(item) ? 'video' : 'image'
            };
        }
        return item;
    }).filter(item => item && item.url);
}

function parseUploadedMedia(files) {
    if (!files) return [];

    return Object.values(files)
        .flat()
        .filter(Boolean)
        .map(file => ({
            url: `/uploads/reviews/${file.filename}`,
            media_type: file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image',
            alt_text: file.originalname
        }));
}

function normalizeStatus(status) {
    if (!status) return 'approved';
    const value = String(status).trim().toLowerCase();
    return ALLOWED_STATUSES.includes(value) ? value : 'approved';
}

function pickText(value) {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text || null;
}

function toPlain(record) {
    if (!record) return record;
    return typeof record.get === 'function' ? record.get({ plain: true }) : record;
}

function getReviewPayload(reviewRecord) {
    const data = toPlain(reviewRecord);
    if (!data) return data;

    return {
        id: data.id,
        reviewable_type: data.reviewable_type,
        reviewable_id: data.reviewable_id,
        package_id: data.package_id,
        custom_trip_id: data.custom_trip_id,
        trip_inquiry_id: data.trip_inquiry_id,
        customer_id: data.customer_id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        reviewer_name: data.reviewer_name,
        reviewer_email: data.reviewer_email,
        reviewer_phone: data.reviewer_phone,
        status: data.status,
        source: data.source,
        metadata: data.metadata,
        media: data.media || [],
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}

function getPackagePayload(packageRecord) {
    if (!packageRecord) return null;
    const data = toPlain(packageRecord);

    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        main_image: data.main_image,
        main_image_alt: data.main_image_alt,
        price: data.price,
        duration_days: data.duration_days
    };
}

function getCustomPackagePayload(inquiryRecord) {
    if (!inquiryRecord) return null;
    const data = toPlain(inquiryRecord);

    return {
        id: data.id,
        destination: data.destination,
        destination_slug: data.destination_slug,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        duration: data.duration,
        status: data.status,
        total_amount: data.total_amount
    };
}

function resolveTarget(body, forcedType, forcedId) {
    const fromBodyType = body.reviewable_type || body.type || body.entity_type;
    const type = reviewRepo.normalizeReviewableType(
        forcedType
        || fromBodyType
        || (body.package_id ? 'package' : null)
        || (body.custom_trip_id || body.custom_booking_id ? 'custom_booking' : null)
        || (body.trip_inquiry_id || body.inquiry_id || body.custom_package_id ? 'custom_package' : null)
    );

    if (type === 'custom_package') {
        const inquiryId = pickText(forcedId || body.trip_inquiry_id || body.inquiry_id || body.custom_package_id || body.reviewable_id);
        if (!inquiryId) return null;

        return {
            reviewable_type: type,
            reviewable_id: null,
            package_id: null,
            custom_trip_id: null,
            trip_inquiry_id: inquiryId
        };
    }

    const id = parseInt(forcedId || body.reviewable_id || body.package_id || body.custom_trip_id || body.custom_booking_id, 10);

    if (!type || !Number.isInteger(id) || id <= 0) {
        return null;
    }

    return {
        reviewable_type: type,
        reviewable_id: id,
        package_id: type === 'package' ? id : null,
        custom_trip_id: type === 'custom_booking' ? id : null,
        trip_inquiry_id: null
    };
}

async function resolvePackageSlugTarget(body) {
    const packageSlug = pickText(body.package_slug || body.packageSlug || body.slug);
    if (!packageSlug) return null;

    const packageRecord = await reviewRepo.findPackageBySlug(packageSlug);
    if (!packageRecord) return { notFound: true };

    return {
        reviewable_type: 'package',
        reviewable_id: packageRecord.id,
        package_id: packageRecord.id,
        custom_trip_id: null,
        trip_inquiry_id: null
    };
}

async function createReview(req, res, forcedType, forcedId) {
    const target = resolveTarget(req.body, forcedType, forcedId) || await resolvePackageSlugTarget(req.body);
    if (target && target.notFound) {
        return res.status(404).json({ success: false, message: 'Package not found' });
    }

    if (!target) {
        return res.status(400).json({ success: false, message: 'Valid review target is required' });
    }

    const targetId = target.reviewable_type === 'custom_package' ? target.trip_inquiry_id : target.reviewable_id;
    const exists = await reviewRepo.targetExists(target.reviewable_type, targetId);
    if (!exists) {
        return res.status(404).json({ success: false, message: 'Review target not found' });
    }

    const rating = parseInt(req.body.rating, 10);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const data = {
        ...target,
        customer_id: pickText(req.body.customer_id),
        rating,
        title: pickText(req.body.title),
        comment: pickText(req.body.comment || req.body.review || req.body.description),
        reviewer_name: pickText(req.body.reviewer_name || req.body.customer_name || req.body.name),
        reviewer_email: pickText(req.body.reviewer_email || req.body.customer_email || req.body.email),
        reviewer_phone: pickText(req.body.reviewer_phone || req.body.customer_phone || req.body.phone),
        status: normalizeStatus(req.body.status),
        source: pickText(req.body.source) || 'api',
        metadata: parseJsonMaybe(req.body.metadata, null)
    };

    const mediaItems = [
        ...parseUploadedMedia(req.files),
        ...parseMediaUrls(req.body)
    ];

    const review = await reviewRepo.createWithMedia(data, mediaItems);
    return res.status(201).json({ success: true, data: review });
}

async function listTargetReviews(req, res, type, id) {
    const result = await reviewRepo.findForTarget(type, id, { status: req.query.status });
    const summary = await reviewRepo.summaryForTarget(type, id);
    return res.json({
        success: true,
        reviews: result.rows.map(getReviewPayload),
        data: result.rows.map(getReviewPayload),
        summary,
        total: result.count
    });
}

/**
 * @swagger
 * /api/v1/package-review:
 *   get:
 *     summary: List package reviews by package id or slug
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: package_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID. Required unless package_slug is provided.
 *       - in: query
 *         name: package_slug
 *         schema:
 *           type: string
 *         description: Package slug. Optional alternative to package_id.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, rejected, all]
 *           default: approved
 *         description: Review status filter
 *     responses:
 *       200:
 *         description: Package reviews found
 *       400:
 *         description: package_id or package_slug is required
 *       404:
 *         description: Package not found
 *
 * /api/v1/custom-package-review:
 *   get:
 *     summary: List custom package reviews by inquiry id
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: inquiry_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Custom package inquiry ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, rejected, all]
 *           default: approved
 *         description: Review status filter
 *     responses:
 *       200:
 *         description: Custom package reviews found
 *       400:
 *         description: inquiry_id is required
 *       404:
 *         description: Custom package inquiry not found
 */
router.get('/', async (req, res) => {
    try {
        const packageId = parseInt(req.query.package_id || req.query.packageId, 10);
        const packageSlug = pickText(req.query.package_slug || req.query.packageSlug || req.query.slug);
        const inquiryId = pickText(req.query.inquiry_id || req.query.trip_inquiry_id || req.query.custom_package_id);

        if (inquiryId) {
            const inquiryRecord = await reviewRepo.findCustomPackageByInquiryId(inquiryId);
            if (!inquiryRecord) {
                return res.status(404).json({ success: false, message: 'Custom package inquiry not found' });
            }

            const result = await reviewRepo.findForTarget('custom_package', inquiryRecord.id, { status: req.query.status });
            const summary = await reviewRepo.summaryForTarget('custom_package', inquiryRecord.id);

            const reviews = result.rows.map(getReviewPayload);

            return res.json({
                success: true,
                custom_package: getCustomPackagePayload(inquiryRecord),
                reviews,
                data: reviews,
                summary,
                total: result.count
            });
        }

        if ((!Number.isInteger(packageId) || packageId <= 0) && !packageSlug) {
            return res.status(400).json({ success: false, message: 'package_id, package_slug, or inquiry_id is required' });
        }

        const packageRecord = Number.isInteger(packageId) && packageId > 0
            ? await reviewRepo.findPackageById(packageId)
            : await reviewRepo.findPackageBySlug(packageSlug);
        if (!packageRecord) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        const result = await reviewRepo.findForTarget('package', packageRecord.id, { status: req.query.status });
        const summary = await reviewRepo.summaryForTarget('package', packageRecord.id);

        const reviews = result.rows.map(getReviewPayload);

        return res.json({
            success: true,
            package: getPackagePayload(packageRecord),
            reviews,
            data: reviews,
            summary,
            total: result.count
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/package-review:
 *   post:
 *     summary: Add package review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - package_id
 *               - rating
 *             properties:
 *               package_id:
 *                 type: integer
 *                 description: Package ID
 *               package_slug:
 *                 type: string
 *                 description: Optional package slug alternative
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               reviewer_name:
 *                 type: string
 *               reviewer_email:
 *                 type: string
 *               reviewer_phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: approved
 *               media_files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               media_urls:
 *                 type: string
 *                 description: Comma-separated media URLs
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - package_id
 *               - rating
 *             properties:
 *               package_id:
 *                 type: integer
 *               package_slug:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               reviewer_name:
 *                 type: string
 *               reviewer_email:
 *                 type: string
 *               reviewer_phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: approved
 *               media_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Package review created
 *       400:
 *         description: Invalid review request
 *       404:
 *         description: Package not found
 *
 * /api/v1/custom-package-review:
 *   post:
 *     summary: Add custom package review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inquiry_id
 *               - rating
 *             properties:
 *               inquiry_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               reviewer_name:
 *                 type: string
 *               reviewer_email:
 *                 type: string
 *               reviewer_phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: approved
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - inquiry_id
 *               - rating
 *             properties:
 *               inquiry_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               reviewer_name:
 *                 type: string
 *               reviewer_email:
 *                 type: string
 *               reviewer_phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 default: approved
 *               media_files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Custom package review created
 *       400:
 *         description: Invalid review request
 *       404:
 *         description: Custom package inquiry not found
 */
router.post('/', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/packages/:packageId', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'package', req.params.packageId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/packages/:packageId/reviews', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'package', req.params.packageId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/:packageId', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'package', req.params.packageId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/:packageId/reviews', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'package', req.params.packageId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/custom-packages/:inquiryId', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'custom_package', req.params.inquiryId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/custom-packages/:inquiryId/reviews', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'custom_package', req.params.inquiryId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/custom-packages/:inquiryId', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'custom_package', req.params.inquiryId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/custom-packages/:inquiryId/reviews', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'custom_package', req.params.inquiryId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/custom-bookings/:customTripId', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/custom-bookings/:customTripId/reviews', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/custom-bookings/:customTripId', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/custom-bookings/:customTripId/reviews', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/custom-trips/:customTripId', async (req, res) => {
    try {
        await listTargetReviews(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/custom-trips/:customTripId', handleReviewMediaUpload, async (req, res) => {
    try {
        await createReview(req, res, 'custom_booking', req.params.customTripId);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const review = await reviewRepo.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
