const express = require('express');
const router = express.Router();
const { services } = require('../container');
const UserController = require('../controllers/UserController');

const userController = new UserController(services.userService);

router.get('/', (req, res) => userController.index(req, res));
router.get('/create', (req, res) => userController.createForm(req, res));
router.post('/', (req, res) => userController.store(req, res));
router.get('/edit/:id', (req, res) => userController.editForm(req, res));
router.get('/change-password/:id', (req, res) => userController.changePasswordForm(req, res));
router.post('/change-password/:id', (req, res) => userController.updatePassword(req, res));
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

module.exports = router;
