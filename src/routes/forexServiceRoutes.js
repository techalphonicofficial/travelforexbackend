const express = require('express');
const router = express.Router();
const { repositories: { forexServiceRepo } } = require('../container');

const normalizePayload = (body) => ({
    country_id: body.country_id,
    code: String(body.code || '').trim().toUpperCase(),
    exchange_type: String(body.exchange_type || '').trim()
});

const validatePayload = ({ country_id, code, exchange_type }) => {
    if (!country_id) return 'Country is required';
    if (!code) return 'Code is required';
    if (!exchange_type) return 'Exchange type is required';
    return null;
};

router.get('/', async (req, res) => {
    try {
        const data = await forexServiceRepo.findAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/by-country/:countryId', async (req, res) => {
    try {
        const data = await forexServiceRepo.findByCountryId(req.params.countryId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await forexServiceRepo.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const payload = normalizePayload(req.body);
        const validationMessage = validatePayload(payload);
        if (validationMessage) return res.status(400).json({ success: false, message: validationMessage });

        const data = await forexServiceRepo.create(payload);
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const payload = normalizePayload(req.body);
        const validationMessage = validatePayload(payload);
        if (validationMessage) return res.status(400).json({ success: false, message: validationMessage });

        const data = await forexServiceRepo.update(req.params.id, payload);
        if (!data) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await forexServiceRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/bulk-delete', async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(Boolean) : [];
        if (!ids.length) return res.status(400).json({ success: false, message: 'No IDs provided' });

        await forexServiceRepo.deleteMany(ids);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
