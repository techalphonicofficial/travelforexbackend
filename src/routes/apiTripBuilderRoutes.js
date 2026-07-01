const express = require('express');
const router = express.Router();
const { services: { tripBuilderService } } = require('../container');

/**
 * @swagger
 * /api/v1/build/initialize:
 *   post:
 *     summary: Start a new Custom Trip
 *     tags: [Trip Builder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Trip initialized
 */
router.post('/initialize', async (req, res) => {
    try {
        const { destination_id, start_date, end_date } = req.body;
        // In real app, get customer_id from token if logged in. Null if guest.
        const customer_id = req.user ? req.user.id : null;

        if (!destination_id || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const trip = await tripBuilderService.initializeTrip(customer_id, destination_id, start_date, end_date);
        
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Initialize Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/build/clone-package:
 *   post:
 *     summary: Clone an existing Package into a Custom Trip
 *     tags: [Trip Builder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               package_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Trip cloned
 */
router.post('/clone-package', async (req, res) => {
    try {
        const { package_id, start_date } = req.body;
        const customer_id = req.user ? req.user.id : null;

        if (!package_id || !start_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const trip = await tripBuilderService.clonePackageIntoTrip(customer_id, package_id, start_date);
        
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Clone Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/build/{id}:
 *   get:
 *     summary: Get full trip itinerary details
 *     tags: [Trip Builder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trip details
 */
router.get('/:id', async (req, res) => {
    try {
        const trip = await tripBuilderService.getTripDetails(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        
        res.json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Get Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/build/{id}/days/{dayId}/hotel:
 *   put:
 *     summary: Select Hotel for a Day
 *     tags: [Trip Builder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: dayId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hotel_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Hotel updated
 */
router.put('/:id/days/:dayId/hotel', async (req, res) => {
    try {
        const { id, dayId } = req.params;
        const { hotel_id } = req.body;

        const trip = await tripBuilderService.setHotelForDay(id, dayId, hotel_id);
        res.json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Hotel Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/build/{id}/days/{dayId}/activities:
 *   post:
 *     summary: Add Activity to a Day
 *     tags: [Trip Builder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: dayId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Activity added
 */
router.post('/:id/days/:dayId/activities', async (req, res) => {
    try {
        const { id, dayId } = req.params;
        const { activity_id } = req.body;

        const trip = await tripBuilderService.addActivityToDay(id, dayId, activity_id);
        res.json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Add Activity Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/build/{id}/days/{dayId}/activities/{activityId}:
 *   delete:
 *     summary: Remove Activity from a Day
 *     tags: [Trip Builder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: dayId
 *         required: true
 *       - in: path
 *         name: activityId
 *         required: true
 *     responses:
 *       200:
 *         description: Activity removed
 */
router.delete('/:id/days/:dayId/activities/:activityId', async (req, res) => {
    try {
        const { id, dayId, activityId } = req.params;

        const trip = await tripBuilderService.removeActivityFromDay(id, dayId, activityId);
        res.json({ success: true, data: trip });
    } catch (error) {
        console.error('TripBuilder Remove Activity Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
