const express = require('express');
const router = express.Router();
const { controllers } = require('../container');
const { moduleController } = controllers;

router.get('/', (req, res) => moduleController.index(req, res));
router.get('/create', (req, res) => moduleController.createForm(req, res));
router.post('/', (req, res) => moduleController.store(req, res));
router.get('/:id/edit', (req, res) => moduleController.editForm(req, res));
router.put('/:id', (req, res) => moduleController.update(req, res));
router.delete('/:id', (req, res) => moduleController.delete(req, res));

module.exports = router;
