/**
 * @swagger
 * components:
 *   schemas:
 *     VideoReview:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-incremented ID
 *         title:
 *           type: string
 *           description: Review title
 *         description:
 *           type: string
 *           description: Review text description
 *         user_name:
 *           type: string
 *           description: Name of the reviewer
 *         user_handle:
 *           type: string
 *           description: Social media or custom handle of the reviewer
 *         user_avatar:
 *           type: string
 *           description: URL/path of the reviewer's avatar image
 *         location:
 *           type: string
 *           description: Location associated with the review
 *         video_url:
 *           type: string
 *           description: URL/path of the review video
 *         likes_count:
 *           type: integer
 *           description: Number of likes
 *         status:
 *           type: boolean
 *           description: Active status of the review
 *         package_id:
 *           type: integer
 *           description: Associated travel package ID
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { repositories: { videoReviewRepo } } = require('../container');

// Multer Storage Configuration for Video Reviews
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/reviews';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `rev-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|webm|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images and videos are allowed!'));
    }
});

const reviewUpload = upload.fields([
    { name: 'video_file', maxCount: 1 },
    { name: 'avatar_file', maxCount: 1 }
]);

// Helper middleware to handle upload errors cleanly
function handleUpload(req, res, next) {
    reviewUpload(req, res, (err) => {
        if (err) {
            if (err.message === 'Request aborted') {
                return res.status(499).json({ success: false, message: 'Upload cancelled by client.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Retrieve all active video reviews
 *     tags: [Video Reviews]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Pass "all" to get all reviews, otherwise defaults to active reviews only.
 *     responses:
 *       200:
 *         description: A list of video reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoReview'
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let data;
        if (status === 'all') {
            data = await videoReviewRepo.findAll();
        } else {
            data = await videoReviewRepo.findActive();
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Get a video review by ID
 *     tags: [Video Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video review ID
 *     responses:
 *       200:
 *         description: Video review details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VideoReview'
 *       404:
 *         description: Video review not found
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await videoReviewRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a new video review
 *     tags: [Video Reviews]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_handle:
 *                 type: string
 *               location:
 *                 type: string
 *               likes_count:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               package_id:
 *                 type: integer
 *               video_file:
 *                 type: string
 *                 format: binary
 *               avatar_file:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_handle:
 *                 type: string
 *               location:
 *                 type: string
 *               likes_count:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               package_id:
 *                 type: integer
 *               video_url:
 *                 type: string
 *               user_avatar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video review created successfully
 */
router.post('/', handleUpload, async (req, res) => {
    try {
        const { title, description, user_name, user_handle, location, likes_count, package_id, status } = req.body;
        
        let video_url = req.body.video_url || null;
        let user_avatar = req.body.user_avatar || null;
        
        if (req.files && req.files['video_file']) {
            video_url = `/uploads/reviews/${req.files['video_file'][0].filename}`;
        }
        if (req.files && req.files['avatar_file']) {
            user_avatar = `/uploads/reviews/${req.files['avatar_file'][0].filename}`;
        }

        const data = {
            title,
            description,
            user_name,
            user_handle,
            location,
            likes_count: parseInt(likes_count) || 0,
            package_id: package_id ? parseInt(package_id) : null,
            status: status === 'on' || status === true || status === 'true',
            video_url,
            user_avatar
        };

        const createdReview = await videoReviewRepo.create(data);
        res.status(201).json({ success: true, data: createdReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   put:
 *     summary: Update an existing video review
 *     tags: [Video Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video review ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_handle:
 *                 type: string
 *               location:
 *                 type: string
 *               likes_count:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               package_id:
 *                 type: integer
 *               video_file:
 *                 type: string
 *                 format: binary
 *               avatar_file:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_handle:
 *                 type: string
 *               location:
 *                 type: string
 *               likes_count:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               package_id:
 *                 type: integer
 *               video_url:
 *                 type: string
 *               user_avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video review updated successfully
 *       404:
 *         description: Video review not found
 */
router.put('/:id', handleUpload, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await videoReviewRepo.findById(id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        const { title, description, user_name, user_handle, location, likes_count, package_id, status } = req.body;
        
        let video_url = req.body.video_url || review.video_url;
        let user_avatar = req.body.user_avatar || review.user_avatar;
        
        if (req.files && req.files['video_file']) {
            // Delete old file if exists
            if (review.video_url) {
                const oldPath = path.join(__dirname, '..', '..', 'public', review.video_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            video_url = `/uploads/reviews/${req.files['video_file'][0].filename}`;
        }
        if (req.files && req.files['avatar_file']) {
            // Delete old file if exists
            if (review.user_avatar) {
                const oldPath = path.join(__dirname, '..', '..', 'public', review.user_avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user_avatar = `/uploads/reviews/${req.files['avatar_file'][0].filename}`;
        }

        const data = {
            title: title !== undefined ? title : review.title,
            description: description !== undefined ? description : review.description,
            user_name: user_name !== undefined ? user_name : review.user_name,
            user_handle: user_handle !== undefined ? user_handle : review.user_handle,
            location: location !== undefined ? location : review.location,
            likes_count: likes_count !== undefined ? parseInt(likes_count) : review.likes_count,
            package_id: package_id !== undefined ? (package_id ? parseInt(package_id) : null) : review.package_id,
            status: status !== undefined ? (status === 'on' || status === true || status === 'true') : review.status,
            video_url,
            user_avatar
        };

        const updatedReview = await videoReviewRepo.update(id, data);
        res.json({ success: true, data: updatedReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a video review
 *     tags: [Video Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video review ID
 *     responses:
 *       200:
 *         description: Video review deleted successfully
 *       404:
 *         description: Video review not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const review = await videoReviewRepo.findById(id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        // Clean up files
        if (review.video_url) {
            const videoPath = path.join(__dirname, '..', '..', 'public', review.video_url);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
        if (review.user_avatar) {
            const avatarPath = path.join(__dirname, '..', '..', 'public', review.user_avatar);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }

        await videoReviewRepo.delete(id);
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/reviews/{id}/like:
 *   post:
 *     summary: Increment likes count for a video review
 *     tags: [Video Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The video review ID
 *     responses:
 *       200:
 *         description: Likes count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 likes_count:
 *                   type: integer
 *       404:
 *         description: Video review not found
 */
router.post('/:id/like', async (req, res) => {
    try {
        const review = await videoReviewRepo.incrementLikes(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, likes_count: review.likes_count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
