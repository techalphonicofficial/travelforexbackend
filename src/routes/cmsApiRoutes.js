const express = require('express');
const router = express.Router();
const { controllers: { pageController } } = require('../container');

/**
 * @openapi
 * /api/v1/pages/slug/{slug}:
 *   get:
 *     summary: Get CMS page by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page data including dynamic sections
 *       404:
 *         description: Page not found
 */
router.get('/slug/:slug', (req, res) => pageController.getPageBySlug(req, res));

/**
 * @openapi
 * /api/v1/pages:
 *   get:
 *     summary: Get all published pages (minimal)
 *     tags: [CMS]
 */
router.get('/', async (req, res) => {
    try {
        const { repositories: { pageRepo } } = require('../container');
        const pages = await pageRepo.findAll(); // Should probably add a findAllPublished
        res.json({ success: true, data: pages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
