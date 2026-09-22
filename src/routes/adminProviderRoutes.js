const express = require('express');

const router = express.Router();

const { controllers } = require('../container');

const ap = (method) => (req, res) =>
    controllers.adminProviderController[method](req, res);

// List all providers
router.get('/', ap('index'));

// Create provider
router.post('/', ap('create'));

// Update provider
router.post('/:id/update', ap('update'));

// Delete provider
router.post('/:id/delete', ap('delete'));

module.exports = router;