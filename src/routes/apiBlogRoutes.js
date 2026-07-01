const express = require('express');
const router = express.Router();
const container = require('../container');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Public API for accessing blog posts
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Retrieve a paginated list of published blog posts
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of blog posts
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
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       content:
 *                         type: string
 *                       status:
 *                         type: string
 *                       published_at:
 *                         type: string
 *                         format: date-time
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             image:
 *                               type: string
 *                             alt_text:
 *                               type: string
 *                             content:
 *                               type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', container.controllers.apiBlogController.getBlogs.bind(container.controllers.apiBlogController));

/**
 * @swagger
 * /api/v1/blogs/{slug}:
 *   get:
 *     summary: Get a specific blog post by its slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the blog post
 *     responses:
 *       200:
 *         description: Detailed blog post including multiple content sections (details)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       image:
 *                         type: string
 *                       alt_text:
 *                         type: string
 *                       content:
 *                         type: string
 *       404:
 *         description: Blog post not found
 */
router.get('/:slug', container.controllers.apiBlogController.getBlogBySlug.bind(container.controllers.apiBlogController));

/**
 * @swagger
 * /api/v1/blogs/{slug}/related:
 *   get:
 *     summary: Get related blog posts based on the category of the specified blog post
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the current blog post
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of related posts to return
 *     responses:
 *       200:
 *         description: A list of related blog posts
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
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       status:
 *                         type: string
 *                       published_at:
 *                         type: string
 *                         format: date-time
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       404:
 *         description: Original blog post not found
 */
router.get('/:slug/related', container.controllers.apiBlogController.getRelatedBlogs.bind(container.controllers.apiBlogController));

module.exports = router;
