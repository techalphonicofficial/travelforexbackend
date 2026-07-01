const express = require('express');
const router = express.Router();
const {
  models: { Newsletter }
} = require('../container');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanString = (value, maxLength) => {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, maxLength) : '';
};

const serializeNewsletter = (row) => {
  const data = row && row.get ? row.get({ plain: true }) : row;
  return {
    id: data.id,
    email: data.email,
    status: data.status,
    subscribed_at: data.subscribed_at,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

/**
 * @swagger
 * /api/v1/newsletter:
 *   post:
 *     summary: Create a newsletter subscription
 *     description: Creates or refreshes one newsletter subscriber by email.
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: customer@example.com
 *           example:
 *             email: customer@example.com
 *     responses:
 *       201:
 *         description: Newsletter subscriber created
 *       200:
 *         description: Existing newsletter subscriber refreshed
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const email = cleanString(body.email, 180).toLowerCase();

    if (!email || !emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const now = new Date();
    const defaults = {
      email,
      status: 'subscribed',
      subscribed_at: now
    };

    const [subscription, created] = await Newsletter.findOrCreate({
      where: { email },
      defaults
    });

    if (!created) {
      const updatePayload = {
        status: 'subscribed',
        subscribed_at: now
      };
      await subscription.update(updatePayload);
    }

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Newsletter subscription created' : 'Newsletter subscription updated',
      data: serializeNewsletter(subscription)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
