const express = require('express');
const router = express.Router();
const { services } = require('../container');
const AuthController = require('../controllers/AuthController');

const authController = new AuthController(services.authService);

router.get('/login', (req, res) => authController.loginForm(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/logout', (req, res) => authController.logout(req, res));

module.exports = router;
