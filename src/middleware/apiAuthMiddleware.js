const jwt = require('jsonwebtoken');
require('dotenv').config();

const apiAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const optionalApiAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query['x-api-key'];
    const validApiKey = process.env.X_API_KEY || 'default-secret-key-123'; // fallback if not in env

    if (!apiKey) {
        return res.status(401).json({ success: false, message: 'x-api-key is missing' });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({ success: false, message: 'Invalid x-api-key' });
    }

    next();
};

module.exports = { apiAuth, optionalApiAuth, apiKeyAuth };
