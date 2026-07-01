const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/reviews';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        files: 10,
        fileSize: 25 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMime = /image\/(jpeg|jpg|png|webp|avif)|video\/(mp4|quicktime|x-msvideo|webm)/;
        const allowedExt = /\.(jpeg|jpg|png|webp|avif|mp4|mov|avi|webm)$/i;
        if (allowedMime.test(file.mimetype) && allowedExt.test(file.originalname)) {
            return cb(null, true);
        }
        cb(new Error('Only review images and videos are allowed'));
    }
});

const reviewMediaUpload = upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'media_files', maxCount: 10 },
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 10 }
]);

function handleReviewMediaUpload(req, res, next) {
    reviewMediaUpload(req, res, (err) => {
        if (err) {
            if (err.message === 'Request aborted') {
                return res.status(499).json({ success: false, message: 'Upload cancelled by client.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}

module.exports = handleReviewMediaUpload;
