const express = require('express');
const router = express.Router();
const { repositories: { continentRepo } } = require('../container');

// GET all continents
router.get('/', async (req, res) => {
    try {
        const data = await continentRepo.findAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single continent
router.get('/:id', async (req, res) => {
    try {
        const data = await continentRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const data = await continentRepo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const data = await continentRepo.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await continentRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
