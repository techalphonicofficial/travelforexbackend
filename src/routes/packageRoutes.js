/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-incremented ID of the package
 *         name:
 *           type: string
 *           description: Name of the travel package
 *         price:
 *           type: number
 *           description: Price of the package
 *         duration_days:
 *           type: integer
 *           description: Number of days of the package duration
 *         status:
 *           type: boolean
 *           description: Active status of the package
 *         sort_order:
 *           type: integer
 *           description: Display priority; lower values are returned first
 *         meta_title:
 *           type: string
 *         meta_description:
 *           type: string
 *         meta_keyword:
 *           type: string
 *         schema:
 *           type: string
 *           description: JSON-LD schema markup
 *         show_in_home_page:
 *           type: boolean
 *           description: Whether the package should be displayed on the home page
 *         description:
 *           type: string
 *           description: Detailed description of the travel package
 *         vendor_id:
 *           type: string
 *           format: uuid
 *           description: UUID of the vendor that owns this package
 *         main_image:
 *           type: string
 *           description: URL/path to the main display image of the package
 *         main_image_alt:
 *           type: string
 *           description: Alternate descriptive text for the main package image
 *         destinations:
 *           type: array
 *           description: List of mapped destinations in this package
 *           items:
 *             type: object
 */

const express = require('express');
const router = express.Router();
const { repositories: { packageRepo } } = require('../container');
const { serializePackageItinerary } = require('../utils/packageItinerary');

/**
 * @swagger
 * /api/v1/packages:
 *   get:
 *     summary: Retrieve all packages
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *         description: Minimum price of the package
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Maximum price of the package
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *         description: Duration in days of the package
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter ending at this date
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name filter
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country name filter
 *       - in: query
 *         name: continent
 *         schema:
 *           type: string
 *         description: Continent name filter
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination slug or name filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category slug or name filter
 *       - in: query
 *         name: package_category_slug
 *         schema:
 *           type: string
 *         description: Package category slug filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of packages
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
 *                     $ref: '#/components/schemas/Package'
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug } = req.query;
        let data;
        if (minPrice || maxPrice || duration || startDate || endDate || city || country || continent || destination || category || package_category_slug) {
            data = await packageRepo.filterPackages({ page, limit, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug });
        } else {
            data = await packageRepo.findAll({ page, limit });
        }
        res.json({ success: true, data: data.rows, total: data.count, currentPage: parseInt(page), totalPages: Math.ceil(data.count / limit) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/filters:
 *   get:
 *     summary: Get dynamic package filter metadata
 *     description: Returns counts and ranges for the package listing sidebar filters.
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for package, destination, city, country, or tour type
 *       - in: query
 *         name: tour_type
 *         schema:
 *           type: string
 *         description: Tour type id, slug, or name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Selected minimum package price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Selected maximum package price
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [1-3, 4-7, 8-14, 15-plus]
 *         description: Duration bucket
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter
 *       - in: query
 *         name: continent
 *         schema:
 *           type: string
 *         description: Continent filter
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination id, slug, or name
 *     responses:
 *       200:
 *         description: Dynamic filter metadata
 */
router.get('/filters', async (req, res) => {
    try {
        const data = await packageRepo.getDynamicFilters(req.query);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/destination/{slug}:
 *   get:
 *     summary: Retrieve packages by destination slug
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The destination slug
 *     responses:
 *       200:
 *         description: A list of packages for the specified destination
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
 *                     $ref: '#/components/schemas/Package'
 */
router.get('/destination/:slug', async (req, res) => {
    try {
        const data = await packageRepo.findByDestinationSlug(req.params.slug);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/{slug}:
 *   get:
 *     summary: Get package by slug
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package details
 *       404:
 *         description: Package not found
 */
router.get('/:slug', async (req, res) => {
    try {
        const data = await packageRepo.findBySlug(req.params.slug);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Not found'
            });
        }

        res.json({
            success: true,
            data: serializePackageItinerary(data)
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * @swagger
 * /api/v1/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', async (req, res) => {
    try {
        const data = await packageRepo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   put:
 *     summary: Update a package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', async (req, res) => {
    try {
        const data = await packageRepo.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   delete:
 *     summary: Delete a package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', async (req, res) => {
    try {
        await packageRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
