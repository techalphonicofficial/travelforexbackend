const express = require('express');
const router = express.Router();
const { controllers } = require('../container');
const { roleController } = controllers;

router.get('/', (req, res) => roleController.index(req, res));
router.get('/create', (req, res) => roleController.createForm(req, res));
router.post('/', (req, res) => roleController.store(req, res));
router.get('/:id/edit', (req, res) => roleController.editForm(req, res));
router.put('/:id', (req, res) => roleController.update(req, res));
router.delete('/:id', (req, res) => roleController.delete(req, res));

module.exports = router;
