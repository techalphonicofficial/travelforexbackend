const express = require('express');
const router = express.Router();
const { controllers, middleware } = require('../container');

const { apiCustomerController } = controllers;
const { apiAuth } = middleware;

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         phone:
 *           type: string


 *     CustomerLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     CustomerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         type:
 *           type: string
 *         customerProfile:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/customers/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerRegister'
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', (req, res) => apiCustomerController.register(req, res));

/**
 * @swagger
 * /api/v1/customers/login:
 *   post:
 *     summary: Customer login
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerLogin'
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', (req, res) => apiCustomerController.login(req, res));

/**
 * @swagger
 * /api/v1/customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 */
router.get('/profile', apiAuth, (req, res) => apiCustomerController.getProfile(req, res));

/**
 * @swagger
 * /api/v1/customers/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerRegister'
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/profile', apiAuth, (req, res) => apiCustomerController.updateProfile(req, res));

/**
 * @swagger
 * /api/v1/customers/change-password:
 *   post:
 *     summary: Change customer password
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/change-password', apiAuth, (req, res) => apiCustomerController.changePassword(req, res));

/**
 * @swagger
 * /api/v1/customers/inquiries:
 *   get:
 *     summary: Get customer inquiry history
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved
 */
router.get('/inquiries', apiAuth, (req, res) => apiCustomerController.getMyInquiries(req, res));

/**
 * @swagger
 * /api/v1/customers/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generated successfully
 */
router.post('/forgot-password', (req, res) => apiCustomerController.forgotPassword(req, res));

/**
 * @swagger
 * /api/v1/customers/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/reset-password', (req, res) => apiCustomerController.resetPassword(req, res));

module.exports = router;
