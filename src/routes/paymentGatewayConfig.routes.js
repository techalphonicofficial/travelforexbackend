const express = require('express');

const router = express.Router();

const paymentGatewayConfigController = require(
    '../controllers/paymentGatewayConfig.controller'
);

// List
router.get(
    '/',
    paymentGatewayConfigController.index
);

// Create
router.post(
    '/',
    paymentGatewayConfigController.create
);

// Update
router.post(
    '/:id/update',
    paymentGatewayConfigController.update
);

// Delete
router.post(
    '/:id/delete',
    paymentGatewayConfigController.delete
);

// Toggle active/inactive
router.post(
    '/:id/toggle',
    paymentGatewayConfigController.toggle
);

module.exports = router;