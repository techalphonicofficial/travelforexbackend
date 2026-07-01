const express = require('express');
const router = express.Router();
const { controllers: { adminWalletController } } = require('../container');

router.get('/requests', (req, res) => adminWalletController.requests(req, res));
router.post('/approve/:id', (req, res) => adminWalletController.approve(req, res));
router.post('/reject/:id', (req, res) => adminWalletController.reject(req, res));

module.exports = router;
