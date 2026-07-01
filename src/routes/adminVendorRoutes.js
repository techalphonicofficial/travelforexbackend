const express = require('express');
const router = express.Router();
const { controllers: { adminVendorController } } = require('../container');

router.get('/requests', (req, res) => adminVendorController.requests(req, res));
router.post('/requests/:id/approve', (req, res) => adminVendorController.approve(req, res));
router.post('/requests/:id/reject', (req, res) => adminVendorController.reject(req, res));

module.exports = router;
