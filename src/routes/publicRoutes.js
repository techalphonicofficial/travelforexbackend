const express = require('express');
const router = express.Router();
const { controllers: { pageController, blogController } } = require('../container');

router.get('/blog', (req, res) => blogController.renderPublicList(req, res));
router.get('/blog/:slug', (req, res) => blogController.renderPublicPost(req, res));
router.get('/:slug', (req, res) => pageController.renderPublicPage(req, res));

module.exports = router;
