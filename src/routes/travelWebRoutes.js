const express = require('express');
const router = express.Router();
const {
    db,
    repositories: {
        continentRepo, countryRepo, cityRepo,
        destinationRepo, categoryRepo, packageRepo, activityRepo, videoReviewRepo
    },
    models: {
        Continent, Country, City, Destination, DestinationMapping,
        DestinationCategory, Category, Package, Activity,
        PackageDestination, PackageInclusion, PackageExclusion, Media, VideoReview
    }
} = require('../container');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'packages';
        if (req.originalUrl.includes('destinations')) folder = 'destinations';
        if (req.originalUrl.includes('reviews')) folder = 'reviews';
        const dir = `public/uploads/${folder}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let prefix = 'pack';
        if (req.originalUrl.includes('destinations')) prefix = 'dest';
        if (req.originalUrl.includes('reviews')) prefix = 'rev';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images and videos are allowed!'));
    }
});

// ──────────────────────────────────────────────────────────
// Helper: wraps multer middleware to catch all upload errors
// (including 'Request aborted') and return a clean JSON error
// instead of crashing the node process.
// ──────────────────────────────────────────────────────────
function handleUpload(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                // Silently ignore client-side aborts (e.g. ngrok drops)
                if (err.message === 'Request aborted') {
                    if (!res.headersSent) {
                        return res.status(499).json({ success: false, message: 'Upload cancelled by client.' });
                    }
                    return;
                }
                return res.status(400).json({ success: false, message: err.message });
            }
            next();
        });
    };
}

// ─────────────────────────────────────────────
// CONTINENTS
// ─────────────────────────────────────────────
router.post('/api/v1/continents/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ success: false, message: 'No IDs provided' });
        await Continent.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/continents', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        res.render('travel/continents/index', { title: 'Continents', continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/continents/create', async (req, res) => {
    res.render('travel/continents/form', { title: 'Create Continent', continent: null });
});

router.get('/continents/:id/edit', async (req, res) => {
    try {
        const continent = await Continent.findByPk(req.params.id);
        res.render('travel/continents/form', { title: 'Edit Continent', continent });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/continents/save', async (req, res) => {
    const { id, name } = req.body;
    try {
        if (id) await Continent.update({ name }, { where: { id } });
        else await Continent.create({ name });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// COUNTRIES
// ─────────────────────────────────────────────
router.get('/countries', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        const continents = await continentRepo.findAll();
        res.render('travel/countries/index', { title: 'Countries', countries, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/countries/create', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        res.render('travel/countries/form', { title: 'Create Country', country: null, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/countries/:id/edit', async (req, res) => {
    try {
        const country = await Country.findByPk(req.params.id);
        const continents = await continentRepo.findAll();
        res.render('travel/countries/form', { title: 'Edit Country', country, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/countries/save', async (req, res) => {
    const { id, name, continent_id } = req.body;
    try {
        if (id) await Country.update({ name, continent_id }, { where: { id } });
        else await Country.create({ name, continent_id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/countries/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Country.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ─────────────────────────────────────────────
// CITIES
// ─────────────────────────────────────────────
router.get('/cities', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        const continents = await Continent.findAll();
        res.render('travel/cities/index', { title: 'Cities', countries, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/cities/create', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/cities/form', { title: 'Create City', city: null, countries });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/cities/:id/edit', async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id, {
            include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
        });
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/cities/form', { title: 'Edit City', city, countries });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/cities/save', async (req, res) => {
    const { id, name, country_id } = req.body;
    try {
        if (id) await City.update({ name, country_id }, { where: { id } });
        else await City.create({ name, country_id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/api/v1/cities/:id', async (req, res) => {
    try {
        await City.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/cities/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await City.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



// ─────────────────────────────────────────────
// DESTINATIONS
// ─────────────────────────────────────────────
router.get('/destinations', async (req, res) => {
    try {
        const destinations = await Destination.findAll({
            include: [
                {
                    model: DestinationMapping, as: 'mappings', include: [
                        {
                            model: City, as: 'city',
                            include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
                        }
                    ]
                },
                { model: Category, as: 'categories', through: { attributes: [] } },
                { model: Media, as: 'gallery' }
            ]
        });
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        res.render('travel/destinations/index', { title: 'Destinations', destinations, continents, categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/destinations/create', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        res.render('travel/destinations/form', { title: 'Create Destination', destination: null, continents, categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/destinations/:id/edit', async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id, {
            include: [{ model: Category, as: 'categories' }]
        });
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        res.render('travel/destinations/form', { title: 'Edit Destination', destination, continents, categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/destinations/save', async (req, res) => {
    const { id, name, type, categories, meta_title, meta_description, meta_keyword, schema, is_trending, is_visa_free } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    try {
        const transaction = await db.transaction();
        try {
            let dest;
            const updateData = { name, type, slug, meta_title, meta_description, meta_keyword, schema, is_trending, is_visa_free };
            if (id) {
                dest = await Destination.findByPk(id);
                await dest.update(updateData, { transaction });
                await DestinationCategory.destroy({ where: { destination_id: id }, transaction });
            } else {
                dest = await Destination.create(updateData, { transaction });
            }
            if (categories && categories.length) {
                await DestinationCategory.bulkCreate(categories.map(cId => ({ destination_id: dest.id, category_id: cId })), { transaction });
            }
            await transaction.commit();
            res.json({ success: true, id: dest.id });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/destinations/:id', async (req, res) => {
    try {
        await Destination.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/destinations/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Destination.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Destination Gallery Routes
router.get('/destinations/:id/gallery', async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id, {
            include: [{ model: Media, as: 'gallery' }]
        });
        if (!destination) return res.status(404).send('Destination not found');
        res.render('travel/destinations/gallery', { title: `Gallery: ${destination.name}`, destination });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/destinations/:id/gallery', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const isVideo = req.file.mimetype.startsWith('video/');
        const media = await Media.create({
            entity_type: 'destination',
            entity_id: req.params.id,
            url: `/uploads/destinations/${req.file.filename}`,
            media_type: isVideo ? 'video' : 'image'
        });

        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/destinations/:id/gallery/:mediaId', async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.mediaId);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        // Delete from filesystem
        const filePath = path.join(__dirname, '..', '..', 'public', media.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await media.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/api/v1/media/:id', async (req, res) => {
    try {
        const { key, label, poster_url, alt_text, is_primary } = req.body;
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        const updateData = {};
        if (key !== undefined) updateData.key = key;
        if (label !== undefined) updateData.label = label;
        if (poster_url !== undefined) updateData.poster_url = poster_url;
        if (alt_text !== undefined) updateData.alt_text = alt_text;
        if (is_primary !== undefined) updateData.is_primary = is_primary;

        await media.update(updateData);
        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/media/:id/poster', upload.single('poster'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        const posterUrl = `/uploads/destinations/${req.file.filename}`;
        await media.update({ poster_url: posterUrl });

        res.json({ success: true, poster_url: posterUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});




// ─────────────────────────────────────────────
// CATEGORIES MASTER
// ─────────────────────────────────────────────
router.get('/categories', async (req, res) => {
    try {
        const categories = await categoryRepo.findAll();
        res.render('travel/categories/index', { title: 'Destination Categories', categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/categories/create', async (req, res) => {
    res.render('travel/categories/form', { title: 'Create Category', category: null });
});

router.get('/categories/:id/edit', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        res.render('travel/categories/form', { title: 'Edit Category', category });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/categories/save', async (req, res) => {
    const { id, name } = req.body;
    try {
        if (id) await Category.update({ name }, { where: { id } });
        else await Category.create({ name });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ─────────────────────────────────────────────
// DESTINATION MAPPING
// ─────────────────────────────────────────────
router.get('/mappings', async (req, res) => {
    try {
        const mappings = await DestinationMapping.findAll({
            include: [
                { model: Destination, as: 'destination' },
                {
                    model: City, as: 'city',
                    include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
                }
            ]
        });
        const destinations = await Destination.findAll();
        const continents = await continentRepo.findAll();
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/mappings/index', { title: 'Destination Mapping', mappings, destinations, continents, countries, cities: [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/mappings', async (req, res) => {
    const { _id, destination_id, city_id } = req.body;
    try {
        if (_id) {
            await DestinationMapping.update({ destination_id, city_id }, { where: { id: _id } });
        } else {
            await DestinationMapping.create({ destination_id, city_id });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/mappings/:id', async (req, res) => {
    try {
        await DestinationMapping.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// PACKAGES MODULE
// ─────────────────────────────────────────────
router.get('/packages', async (req, res) => {
    try {
        const packages = await packageRepo.findAll();

        // return res.json(packages);
        res.render('travel/packages/index', { title: 'Packages', packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/packages/create', async (req, res) => {
    try {

        const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
        const categories = await categoryRepo.findAll();
        const activities = await Activity.findAll({ order: [['name', 'ASC']] });
        res.render('travel/packages/create', {
            title: 'Create Package',
            pkg: null,
            destinations,
            categories,
            activities
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.get('/packages/:id/edit', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id, {
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    include: [{ model: Destination, as: 'destination' }]
                },
                { model: PackageInclusion, as: 'inclusions' },
                { model: PackageExclusion, as: 'exclusions' },
                { model: Media, as: 'gallery' }
            ],
            order: [[{ model: PackageDestination, as: 'destinations' }, 'order', 'ASC']]
        });

        if (!pkg) return res.status(404).send('Package not found');

        const plainPkg = pkg.get({ plain: true });

        // Transform for frontend form (simplified for JSON)
        plainPkg.stays = plainPkg.destinations.map(pd => ({
            id: pd.destination.id,
            name: pd.destination.name,
            nights: pd.nights,
            activities: pd.activities || {}
        }));

        const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
        const activities = await Activity.findAll({ order: [['name', 'ASC']] });

        res.render('travel/packages/edit', {
            title: `Edit: ${plainPkg.name}`,
            pkg: plainPkg,
            destinations: destinations,
            activities: activities
        });

    } catch (err) {
        console.error('Edit error:', err);
        res.status(500).send(err.message);
    }
});
router.get('/packages/:id', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id, {
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    include: [
                        { model: Destination, as: 'destination' }
                    ]
                },
                { model: PackageInclusion, as: 'inclusions' },
                { model: PackageExclusion, as: 'exclusions' }
            ],
            order: [
                [{ model: PackageDestination, as: 'destinations' }, 'order', 'ASC']
            ]
        });

        if (!pkg) return res.status(404).send('Package not found');

        res.render('travel/packages/detail', {
            title: `Package: ${pkg.name}`,
            pkg
        });

    } catch (err) {
        console.error('DETAIL VIEW ERROR:', err);
        res.status(500).send('Something broke! | ' + err.message);
    }
});

// Gallery Management Routes
router.post('/packages/:id/gallery', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const isVideo = req.file.mimetype.startsWith('video/');
        const media = await Media.create({
            entity_type: 'package',
            entity_id: req.params.id,
            url: `/uploads/packages/${req.file.filename}`,
            media_type: isVideo ? 'video' : 'image'
        });

        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/packages/:id/gallery/:mediaId', async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.mediaId);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        // Delete from filesystem
        const filePath = path.join(__dirname, '..', '..', 'public', media.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await media.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/packages/save', async (req, res) => {
    const { id, name, duration, price, description, show_in_home_page, destinations, inclusions, exclusions } = req.body;

    try {
        const transaction = await db.transaction();

        try {
            let pkg;
            if (id) {
                // Update existing package
                pkg = await Package.findByPk(id);
                if (!pkg) throw new Error('Package not found');
                await pkg.update({
                    name,
                    duration_days: duration,
                    price: price || 0,
                    description: description || '',
                    show_in_home_page: show_in_home_page || false
                }, { transaction });

                // Delete existing related data to recreate
                await PackageDestination.destroy({ where: { package_id: id }, transaction });
                await PackageInclusion.destroy({ where: { package_id: id }, transaction });
                await PackageExclusion.destroy({ where: { package_id: id }, transaction });
            } else {
                // Create new Package
                pkg = await Package.create({
                    name,
                    duration_days: duration,
                    price: price || 0,
                    description: description || '',
                    show_in_home_page: show_in_home_page || false
                }, { transaction });
            }

            // 2. Save Destinations with JSON activities
            if (destinations && destinations.length) {
                for (let i = 0; i < destinations.length; i++) {
                    const dest = destinations[i];
                    await PackageDestination.create({
                        package_id: pkg.id,
                        destination_id: dest.destinationId,
                        nights: dest.nights,
                        order: i + 1,
                        activities: dest.activities || {}
                    }, { transaction });
                }
            }

            // 3. Inclusions
            if (inclusions?.length) {
                await PackageInclusion.bulkCreate(
                    inclusions.map(text => ({ package_id: pkg.id, text })),
                    { transaction }
                );
            }

            // 4. Exclusions
            if (exclusions?.length) {
                await PackageExclusion.bulkCreate(
                    exclusions.map(text => ({ package_id: pkg.id, text })),
                    { transaction }
                );
            }

            await transaction.commit();
            res.json({
                success: true,
                message: id ? 'Package updated successfully!' : 'Package created successfully!',
                id: pkg.id
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// VIDEO REVIEWS
// ─────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await videoReviewRepo.findAll();
        res.render('travel/reviews/index', { title: 'Video Reviews', reviews });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/reviews/create', async (req, res) => {
    try {
        const packages = await packageRepo.findAll();
        res.render('travel/reviews/form', { title: 'Create Video Review', review: null, packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/reviews/:id/edit', async (req, res) => {
    try {
        const review = await videoReviewRepo.findById(req.params.id);
        if (!review) return res.status(404).send('Review not found');
        const packages = await packageRepo.findAll();
        res.render('travel/reviews/form', { title: `Edit Review`, review, packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/reviews/save', handleUpload(upload.fields([{ name: 'video_file', maxCount: 1 }, { name: 'avatar_file', maxCount: 1 }])), async (req, res) => {
    try {
        const { id, title, description, user_name, user_handle, location, likes_count, package_id, status } = req.body;
        
        let video_url = req.body.existing_video_url || null;
        let user_avatar = req.body.existing_avatar_url || null;
        
        if (req.files && req.files['video_file']) {
            video_url = `/uploads/reviews/${req.files['video_file'][0].filename}`;
        }
        if (req.files && req.files['avatar_file']) {
            user_avatar = `/uploads/reviews/${req.files['avatar_file'][0].filename}`;
        }

        const data = {
            title, description, user_name, user_handle, location,
            likes_count: parseInt(likes_count) || 0,
            package_id: package_id || null,
            status: status === 'on' || status === true || status === 'true',
            video_url,
            user_avatar
        };

        if (id) {
            await videoReviewRepo.update(id, data);
        } else {
            await videoReviewRepo.create(data);
        }
        
        res.json({ success: true, message: 'Review saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/api/v1/reviews/:id', async (req, res) => {
    try {
        await videoReviewRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────
router.get('/api/v1/cities/paginated', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const result = await cityRepo.findPaginated(page, limit, search);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/destinations/:id/details', async (req, res) => {
    try {
        const mapping = await DestinationMapping.findOne({ where: { destination_id: req.params.id } });
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });
        const cityMappings = await DestinationMapping.findAll({
            where: { city_id: mapping.city_id },
            include: [{ model: Destination, as: 'destination' }]
        });
        const spots = cityMappings.map(m => m.destination).filter(Boolean);
        res.json({ city_id: mapping.city_id, spots });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/activities/by-destination/:destId', async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { destination_id: req.params.destId },
            order: [['name', 'ASC']]
        });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/reviews', async (req, res) => {
    try {
        const data = await videoReviewRepo.findActive();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/reviews/:id/like', async (req, res) => {
    try {
        const review = await videoReviewRepo.incrementLikes(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, likes_count: review.likes_count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
