class BannerController {
    constructor(bannerRepo, mediaRepo) {
        this.bannerRepo = bannerRepo;
        this.mediaRepo = mediaRepo;
    }

    async index(req, res) {
        try {
            const banners = await this.bannerRepo.findAll();
            res.render('cms/banners/index', { title: 'Banner Management', banners });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async create(req, res) {
        res.render('cms/banners/form', { title: 'Add New Banner', banner: null });
    }

    async edit(req, res) {
        try {
            const banner = await this.bannerRepo.findById(req.params.id);
            if (!banner) return res.status(404).send('Banner not found');
            res.render('cms/banners/form', { title: 'Edit Banner', banner });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async store(req, res) {
        try {
            const data = req.body;
            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/banners/${req.file.filename}`;
                data.image_path = imagePath;
            }
            const banner = await this.bannerRepo.create(data);
            
            if (imagePath) {
                await this.mediaRepo.create({
                    entity_type: 'banner',
                    entity_id: banner.id,
                    url: imagePath,
                    is_primary: true
                });
            }
            res.redirect('/cms/banners');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async update(req, res) {
        try {
            const data = req.body;
            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/banners/${req.file.filename}`;
                data.image_path = imagePath;
            }
            await this.bannerRepo.update(req.params.id, data);

            if (imagePath) {
                await this.mediaRepo.deleteByEntity('banner', req.params.id);
                await this.mediaRepo.create({
                    entity_type: 'banner',
                    entity_id: req.params.id,
                    url: imagePath,
                    is_primary: true
                });
            }
            res.redirect('/cms/banners');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async delete(req, res) {
        try {
            await this.bannerRepo.delete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = BannerController;
