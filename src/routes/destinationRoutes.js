const express = require('express');
const router = express.Router();
const { repositories: { destinationRepo } } = require('../container');

/**
 * @openapi
 * /api/v1/destinations:
 *   get:
 *     summary: Get all destinations
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter destinations by category
 *     responses:
 *       200:
 *         description: List of destinations
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 */
router.get('/', async (req, res) => {
    try {
        let data;
        if (req.query.category_id) {
            data = await destinationRepo.findByCategory(req.query.category_id);
        } else {
            data = await destinationRepo.findAll();
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/v1/destinations/slug/{slug}:
 *   get:
 *     summary: Get destination by slug with full details and gallery
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The destination slug
 *     responses:
 *       200:
 *         description: Destination details, gallery, and geographical mappings
 *       404:
 *         description: Destination not found
 */
router.get('/slug/:slug', async (req, res) => {
    try {
        const data = await destinationRepo.findBySlug(req.params.slug);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await destinationRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



router.post('/', async (req, res) => {
    try {
        const data = await destinationRepo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const data = await destinationRepo.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await destinationRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
