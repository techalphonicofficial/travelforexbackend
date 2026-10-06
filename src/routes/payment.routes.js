const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const pc = (method) => (req, res) =>
    controllers.paymentController[method](req, res);

/**
 * @swagger
 * /api/v1/payments/initiate:
 *   post:
 *     summary: Initiate ICICI payment
 *     tags:
 *       - Payments
 */
router.post('/initiate', pc('initiate'));

/**
 * @swagger
 * /api/v1/payments/icici/webhook:
 *   post:
 *     summary: Receive ICICI payment callback
 *     tags:
 *       - Payments
 */
router.post('/icici/webhook', pc('iciciPaymentAdvice'));

module.exports = router;