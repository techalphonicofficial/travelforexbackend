const express = require('express');
const router = express.Router();
const { controllers: { pageController, bannerController, blogController, mediaController }, repositories: { appSettingRepo } } = require('../container');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let entity = 'others';
        if (req.originalUrl.includes('pages')) entity = 'pages';
        else if (req.originalUrl.includes('banners')) entity = 'banners';
        else if (req.originalUrl.includes('blog')) entity = 'blog';
        else if (req.originalUrl.includes('media')) entity = 'media';
        else if (req.originalUrl.includes('footer')) entity = 'settings';
        
        const dir = `public/uploads/${entity}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'file';
        if (req.originalUrl.includes('pages')) prefix = 'page';
        else if (req.originalUrl.includes('banners')) prefix = 'banner';
        else if (req.originalUrl.includes('blog')) prefix = 'blog';
        else if (req.originalUrl.includes('media')) prefix = 'med';
        else if (req.originalUrl.includes('footer')) prefix = 'logo';
        
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Pages
router.get('/pages', (req, res) => pageController.index(req, res));
router.get('/pages/create', (req, res) => pageController.create(req, res));
router.get('/pages/:id/edit', (req, res) => pageController.edit(req, res));
router.post('/pages/save', upload.single('feature_image'), (req, res) => pageController.store(req, res));
router.post('/pages/:id/update', upload.single('feature_image'), (req, res) => pageController.update(req, res));
router.delete('/pages/:id', (req, res) => pageController.delete(req, res));

// Footer
router.get('/footer', async (req, res) => {
    try {
        const company_logo_url = await appSettingRepo.get('company_logo_url') || '';
        const footer_content = await appSettingRepo.get('footer_content') || '';
        const rawFooterColumns = await appSettingRepo.get('footer_columns');
        let footer_columns = { company: [], explore: [], support: [], trust_safety: [] };
        if (rawFooterColumns) {
            try { footer_columns = JSON.parse(rawFooterColumns); } catch (e) { }
        }
        res.render('cms/footer/index', {
            title: 'Footer Settings',
            company_logo_url,
            footer_content,
            footer_columns
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/footer/save', upload.single('company_logo_file'), async (req, res) => {
    try {
        let company_logo_url = req.body.company_logo_url || '';
        if (req.file) {
            company_logo_url = `/uploads/settings/${req.file.filename}`;
        }
        const { footer_content, footer_columns } = req.body;

        await appSettingRepo.set('footer_content', footer_content || '');
        await appSettingRepo.set('company_logo_url', company_logo_url || '');

        if (footer_columns) {
            await appSettingRepo.set('footer_columns', typeof footer_columns === 'string' ? footer_columns : JSON.stringify(footer_columns));
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Banners
router.get('/banners', (req, res) => bannerController.index(req, res));
router.get('/banners/create', (req, res) => bannerController.create(req, res));
router.get('/banners/:id/edit', (req, res) => bannerController.edit(req, res));
router.post('/banners/save', upload.single('image'), (req, res) => bannerController.store(req, res));
router.post('/banners/:id/update', upload.single('image'), (req, res) => bannerController.update(req, res));
router.delete('/banners/:id', (req, res) => bannerController.delete(req, res));

// Blog Categories
router.get('/blog/categories', (req, res) => blogController.listCategories(req, res));
router.post('/blog/categories', (req, res) => blogController.storeCategory(req, res));

// Blog Posts
router.get('/blog/posts', (req, res) => blogController.index(req, res));
router.get('/blog/posts/create', (req, res) => blogController.create(req, res));
router.get('/blog/posts/:id/edit', (req, res) => blogController.edit(req, res));
router.post('/blog/posts/save', upload.single('featured_image'), (req, res) => blogController.store(req, res));
router.post('/blog/posts/:id/update', upload.single('featured_image'), (req, res) => blogController.update(req, res));
router.delete('/blog/posts/:id', (req, res) => blogController.delete(req, res));

// Media Library
router.get('/media/all', (req, res) => mediaController.getAll(req, res));
router.post('/media/upload', upload.single('media'), (req, res) => mediaController.upload(req, res));

module.exports = router;
