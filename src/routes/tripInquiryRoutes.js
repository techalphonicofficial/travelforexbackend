const express = require('express');
const router = express.Router();
const { controllers: { apiTripInquiryController }, middleware: { optionalApiAuth, apiKeyAuth } } = require('../container');

/**
 * @swagger
 * tags:
 *   - name: Trip Inquiries
 *     description: Customize-flow trip inquiry management
 */

/**
 * @swagger
 * /api/v1/trip-inquiries:
 *   post:
 *     summary: Submit a new trip inquiry (customize flow)
 *     tags: [Trip Inquiries]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip
 *             properties:
 *               customer:
 *                 type: object
 *                 properties:
 *                   id:    { type: string }
 *                   name:  { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *               trip:
 *                 type: object
 *                 required: [destination]
 *                 properties:
 *                   destination:      { type: string, example: Kerala }
 *                   destination_slug: { type: string, example: kerala }
 *                   travel_with:      { type: string, example: Luxury }
 *                   duration:         { type: string, example: "7-8 Days" }
 *                   departure_city:   { type: string }
 *                   departure_date:   { type: string }
 *                   total_travellers: { type: integer }
 *                   rooms:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         adults:     { type: integer }
 *                         children:   { type: integer }
 *                         child_ages: { type: array, items: { type: integer } }
 *                   cities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:      { type: integer }
 *                         name:    { type: string }
 *                         country: { type: string }
 *                         state:   { type: string }
 *                         type:    { type: string }
 *                         tags:    { type: array, items: { type: string } }
 *               source: { type: string, example: customize_flow }
 *     responses:
 *       201:
 *         description: Trip inquiry created with tax info
 *       400:
 *         description: Validation error
 *       403:
 *         description: Invalid optional bearer token
 */
router.post('/', optionalApiAuth, (req, res) => apiTripInquiryController.create(req, res));

/**
 * GET /api/v1/trip-inquiries/inquiries/:id
 * Public endpoint — returns full inquiry data + city gallery images (no auth required)
 */
router.get('/inquiries/:id', (req, res) => apiTripInquiryController.getByIdPublic(req, res));

/**
 * @swagger
 * /api/v1/trip-inquiries:
 *   get:
 *     summary: List all trip inquiries (admin, paginated)
 *     tags: [Trip Inquiries]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by customer name, email, phone, or destination
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, quoted, converted, cancelled]
 *     responses:
 *       200:
 *         description: Paginated list of inquiries
 */
router.get('/', (req, res) => apiTripInquiryController.list(req, res));

/**
 * @swagger
 * /api/v1/trip-inquiries/{id}:
 *   get:
 *     summary: Get a single trip inquiry by ID
 *     tags: [Trip Inquiries]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trip inquiry detail
 *       404:
 *         description: Inquiry not found
 */
router.get('/:id', (req, res) => apiTripInquiryController.getById(req, res));

/**
 * @swagger
 * /api/v1/trip-inquiries/{id}/status:
 *   patch:
 *     summary: Update inquiry status
 *     tags: [Trip Inquiries]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, quoted, converted, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Inquiry not found
 */
router.patch('/:id/status', apiKeyAuth, (req, res) => apiTripInquiryController.updateStatus(req, res));

/**
 * @swagger
 * /api/v1/trip-inquiries/{id}/price:
 *   patch:
 *     summary: Set base price – auto-calculates GST
 *     tags: [Trip Inquiries]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [base_price]
 *             properties:
 *               base_price:
 *                 type: number
 *                 example: 50000
 *     responses:
 *       200:
 *         description: Price calculated with full tax breakdown
 *       404:
 *         description: Inquiry not found
 */
router.patch('/:id/price', apiKeyAuth, (req, res) => apiTripInquiryController.setPrice(req, res));

module.exports = router;
