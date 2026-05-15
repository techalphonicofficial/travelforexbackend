const express = require('express');
const router = express.Router();
const { controllers: { categoryController } } = require('../container');

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     summary: Get all travel categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created successfully
 *
 * /api/v1/categories/home:
 *   get:
 *     summary: Get categories shown on home page
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of home categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 *
 * /api/v1/categories/bulk-delete:
 *   post:
 *     summary: Bulk delete categories
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 *
 * /api/v1/categories/reorder:
 *   post:
 *     summary: Reorder categories
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     sort_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Reordered successfully
 */


router.get('/', (req, res) => categoryController.getAll(req, res));
router.get('/home',(req,res)=> categoryController.getHome(req,res));
router.get('/get-category', (req, res) => categoryController.getAll(req, res));
router.get('/:id', (req, res) => categoryController.getById(req, res));
router.post('/', (req, res) => categoryController.create(req, res));
router.put('/:id', (req, res) => categoryController.update(req, res));
router.post('/bulk-delete', (req, res) => categoryController.bulkDelete(req, res));
router.delete('/:id', (req, res) => categoryController.delete(req, res));
router.post('/reorder', (req, res) => categoryController.reorder(req, res));

module.exports = router;
