const express = require('express');
const router = express.Router();
const { controllers } = require('../container');
const { permissionController } = controllers;

router.get('/', (req, res) => permissionController.index(req, res));
router.get('/create', (req, res) => permissionController.createForm(req, res));
router.post('/', (req, res) => permissionController.store(req, res));
router.get('/edit', (req, res) => res.redirect('/permissions'));
router.get('/:id/edit', (req, res) => permissionController.editForm(req, res));
router.put('/:id', (req, res) => permissionController.update(req, res));
router.delete('/:id', (req, res) => permissionController.delete(req, res));

module.exports = router;
