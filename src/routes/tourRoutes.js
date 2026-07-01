/**
 * @swagger
 * tags:
 *   - name: Tours
 *     description: Public tour link resolver APIs
 *
 * components:
 *   schemas:
 *     TourResolverResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             resolved:
 *               type: boolean
 *               example: true
 *             type:
 *               type: string
 *               example: package
 *             package_id:
 *               type: integer
 *               example: 29
 *             package_slug:
 *               type: string
 *               example: bangkok-explorer-5n6d
 *             package_name:
 *               type: string
 *               example: Bangkok Explorer - 5N6D
 *             destination:
 *               type: string
 *               nullable: true
 *               example: switzerland
 *             view:
 *               type: string
 *               nullable: true
 *               example: itinerary
 *             section:
 *               type: string
 *               nullable: true
 *               example: inclusions
 *             web_url:
 *               type: string
 *               example: /travel/packages/29#inclusions
 *             tour_url:
 *               type: string
 *               example: /tours?destination=switzerland&view=itinerary&package=bangkok-explorer-5n6d
 *             api_url:
 *               type: string
 *               example: /api/v1/packages/bangkok-explorer-5n6d
 *             package:
 *               $ref: '#/components/schemas/Package'
 */

const express = require('express');
const router = express.Router();
const { repositories: { packageRepo } } = require('../container');

const clean = (value) => String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/["']/g, '');

const toPlain = (row) => (row && row.get ? row.get({ plain: true }) : row);

const buildTourUrl = (req, pkg) => {
    const params = new URLSearchParams();
    if (req.query.destination) params.set('destination', String(req.query.destination));
    if (req.query.view) params.set('view', String(req.query.view));
    params.set('package', pkg.slug || String(pkg.id));
    return `/tours?${params.toString()}`;
};

const buildPackageResponse = (req, pkg) => {
    const section = clean(req.query.section || req.query.hash);
    const webUrl = `/travel/packages/${pkg.id}${section ? `#${encodeURIComponent(section)}` : ''}`;

    return {
        resolved: true,
        type: 'package',
        package_id: pkg.id,
        package_slug: pkg.slug,
        package_name: pkg.name,
        destination: req.query.destination || null,
        view: req.query.view || null,
        section: section || null,
        web_url: webUrl,
        tour_url: buildTourUrl(req, pkg),
        api_url: `/api/v1/packages/${pkg.slug || pkg.id}`,
        package: pkg
    };
};

const resolveTour = async (req, res) => {
    try {
        const packageRef = clean(req.params.slug || req.query.package || req.query.package_slug || req.query.slug);
        const destination = clean(req.query.destination);

        if (packageRef) {
            const packageRow = /^\d+$/.test(packageRef)
                ? await packageRepo.findById(packageRef)
                : await packageRepo.findBySlug(packageRef.toLowerCase());

            if (!packageRow) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found',
                    data: {
                        resolved: false,
                        type: 'package',
                        package_ref: packageRef,
                        fallback_url: destination
                            ? `/travel/packages?search=${encodeURIComponent(destination)}`
                            : '/travel/packages'
                    }
                });
            }

            return res.json({
                success: true,
                data: buildPackageResponse(req, toPlain(packageRow))
            });
        }

        if (destination) {
            const packages = await packageRepo.filterPackages({ destination });
            return res.json({
                success: true,
                data: {
                    resolved: true,
                    type: 'destination',
                    destination,
                    web_url: `/travel/packages?search=${encodeURIComponent(destination)}`,
                    packages_count: Array.isArray(packages) ? packages.length : 0,
                    packages
                }
            });
        }

        return res.status(400).json({
            success: false,
            message: 'package, package_slug, slug, path slug, or destination is required'
        });
    } catch (err) {
        console.error('Tour resolver API error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @swagger
 * /api/v1/tours:
 *   get:
 *     summary: Resolve a frontend tour URL to package data
 *     description: Accepts the same query shape as /tours, for example destination, view, and package. URL fragments such as #inclusions are not sent to APIs by browsers; pass section=inclusions when needed.
 *     tags: [Tours]
 *     parameters:
 *       - in: query
 *         name: package
 *         schema:
 *           type: string
 *         description: Package slug or ID
 *         example: bangkok-explorer-5n6d
 *       - in: query
 *         name: package_slug
 *         schema:
 *           type: string
 *         description: Alternative package slug parameter
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Alternative package slug parameter
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination slug/name fallback if package is not supplied
 *         example: switzerland
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *         description: Frontend view hint
 *         example: itinerary
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Optional anchor/section hint, such as inclusions
 *         example: inclusions
 *     responses:
 *       200:
 *         description: Tour/package resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TourResolverResponse'
 *       400:
 *         description: Missing package or destination
 *       404:
 *         description: Package not found
 */
router.get('/', resolveTour);

/**
 * @swagger
 * /api/v1/tours/resolve:
 *   get:
 *     summary: Resolve a frontend tour URL to package data
 *     description: Alias of GET /api/v1/tours for clients that prefer an explicit resolve path.
 *     tags: [Tours]
 *     parameters:
 *       - in: query
 *         name: package
 *         schema:
 *           type: string
 *         description: Package slug or ID
 *         example: bangkok-explorer-5n6d
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination slug/name fallback if package is not supplied
 *         example: switzerland
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *         description: Frontend view hint
 *         example: itinerary
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Optional anchor/section hint, such as inclusions
 *         example: inclusions
 *     responses:
 *       200:
 *         description: Tour/package resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TourResolverResponse'
 *       400:
 *         description: Missing package or destination
 *       404:
 *         description: Package not found
 */
router.get('/resolve', resolveTour);

/**
 * @swagger
 * /api/v1/tours/{slug}:
 *   get:
 *     summary: Resolve a tour package by slug or ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Package slug or ID
 *         example: bangkok-explorer-5n6d
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Optional destination context
 *         example: switzerland
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *         description: Frontend view hint
 *         example: itinerary
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Optional anchor/section hint, such as inclusions
 *         example: inclusions
 *     responses:
 *       200:
 *         description: Tour/package resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TourResolverResponse'
 *       404:
 *         description: Package not found
 */
router.get('/:slug', resolveTour);

module.exports = router;
