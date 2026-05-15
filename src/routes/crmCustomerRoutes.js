const express = require('express');
const router = express.Router();
const { controllers } = require('../container');

router.get('/', (req, res) => controllers.crmCustomerController.index(req, res));

module.exports = router;
