class PageController {
    constructor(pageRepo, mediaRepo) {
        this.pageRepo = pageRepo;
        this.mediaRepo = mediaRepo;
    }

    async index(req, res) {
        try {
            const pages = await this.pageRepo.findAll();
            res.render('cms/pages/index', { title: 'Page Management', pages });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async create(req, res) {
        res.render('cms/pages/form', { title: 'Create Page', page: null });
    }

    async edit(req, res) {
        try {
            const page = await this.pageRepo.findById(req.params.id);
            if (!page) return res.status(404).send('Page not found');
            res.render('cms/pages/form', { title: 'Edit Page', page });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/pages/${req.file.filename}`;
                data.feature_image = imagePath;
            }

            // Parse sections
            let sections = [];
            if (data.sections && (Array.isArray(data.sections) || typeof data.sections === 'object')) {
                // If body-parser/multer already parsed it as nested
                sections = Array.isArray(data.sections) ? data.sections : Object.values(data.sections);
                delete data.sections;
            } else {
                // Parse from flat keys (sections[0][key], etc.)
                Object.keys(data).forEach(key => {
                    const match = key.match(/^sections\[(\d+)\]\[(\w+)\]$/);
                    if (match) {
                        const index = match[1];
                        const field = match[2];
                        if (!sections[index]) sections[index] = {};
                        sections[index][field] = data[key];
                        delete data[key];
                    }
                });
            }

            await this.pageRepo.update(id, data);

            // Update Media
            if (imagePath) {
                await this.mediaRepo.deleteByEntity('page', id);
                await this.mediaRepo.create({
                    entity_type: 'page',
                    entity_id: id,
                    url: imagePath,
                    is_primary: true
                });
            }

            // Update sections (Delete old and recreate)
            await this.pageRepo.PageDetail.destroy({ where: { page_id: id } });
            if (sections && sections.length > 0) {
                for (const section of sections.filter(Boolean)) {
                    section.page_id = id;
                    await this.pageRepo.PageDetail.create(section);
                }
            }

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await this.pageRepo.delete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async renderPublicPage(req, res) {
        try {
            const page = await this.pageRepo.findBySlug(req.params.slug);
            if (!page) return res.status(404).send('Page not found');
            res.render('public/page', { 
                title: page.meta_title || page.title, 
                page,
                layout: 'layouts/public'
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async getPageBySlug(req, res) {
        try {
            const page = await this.pageRepo.findBySlug(req.params.slug);
            if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
            res.json({ success: true, data: page });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async store(req, res) {
        try {
            const data = req.body;
            if (req.file) {
                data.feature_image = `/uploads/pages/${req.file.filename}`;
            }

            // Parse sections from flat or nested body
            let sections = [];
            if (data.sections && (Array.isArray(data.sections) || typeof data.sections === 'object')) {
                sections = Array.isArray(data.sections) ? data.sections : Object.values(data.sections);
                delete data.sections;
            } else {
                Object.keys(data).forEach(key => {
                    const match = key.match(/^sections\[(\d+)\]\[(\w+)\]$/);
                    if (match) {
                        const index = match[1];
                        const field = match[2];
                        if (!sections[index]) sections[index] = {};
                        sections[index][field] = data[key];
                        delete data[key];
                    }
                });
            }

            const page = await this.pageRepo.create(data);

            // Save Media
            if (imagePath) {
                await this.mediaRepo.create({
                    entity_type: 'page',
                    entity_id: page.id,
                    url: imagePath,
                    is_primary: true
                });
            }

            // Save sections
            if (sections.length > 0) {
                for (const section of sections.filter(Boolean)) {
                    section.page_id = page.id;
                    await this.pageRepo.PageDetail.create(section);
                }
            }

            res.status(201).json({ success: true, page });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = PageController;
