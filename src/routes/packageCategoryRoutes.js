const express = require('express');
const router = express.Router();
const { controllers: { packageCategoryController } } = require('../container');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration for Package Categories
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/package-categories';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `pkgcat-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed!'));
    }
});

// Helper for error catching
function handleUpload(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
            next();
        });
    };
}

/**
 * @swagger
 * /api/v1/package-categories/get-package-category:
 *   get:
 *     summary: Get package categories with their parent category nested inside
 *     tags: [Package Categories]
 *     responses:
 *       200:
 *         description: Package category list
 */
router.get('/get-package-category', (req, res) => packageCategoryController.getWithParent(req, res));
router.get('/', (req, res) => packageCategoryController.getAll(req, res));
router.get('/:id', (req, res) => packageCategoryController.getById(req, res));
router.post('/', handleUpload(upload.single('feature_image_file')), (req, res) => packageCategoryController.create(req, res));
router.put('/:id', handleUpload(upload.single('feature_image_file')), (req, res) => packageCategoryController.update(req, res));
router.post('/bulk-delete', (req, res) => packageCategoryController.bulkDelete(req, res));
router.delete('/:id', (req, res) => packageCategoryController.delete(req, res));

module.exports = router;
