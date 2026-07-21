class PackageCategoryController {
    constructor(packageCategoryRepo, packageCategoryModel) {
        this.packageCategoryRepo = packageCategoryRepo;
        this.packageCategoryModel = packageCategoryModel;
    }

    async getAll(req, res) {
        try {
            const data = await this.packageCategoryRepo.findAll();
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getWithParent(req, res) {
        try {
            const rows = await this.packageCategoryRepo.findAll();
            const data = rows.map(row => {
                const category = row.get ? row.get({ plain: true }) : { ...row };
                const parent = category.category || null;
                delete category.category;

                return {
                    ...category,
                    parent
                };
            });

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getById(req, res) {
        try {
            const data = await this.packageCategoryRepo.findById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async create(req, res) {
        try {
            const body = { ...req.body };
            if (req.file) {
                body.feature_image = `/uploads/package-categories/${req.file.filename}`;
            }
            // Parse buttons JSON
            if (body.buttons && typeof body.buttons === 'string') {
                try { body.buttons = JSON.parse(body.buttons); } catch(e) { body.buttons = []; }
            }
            if (body.category_id === '') body.category_id = null;
            const data = await this.packageCategoryRepo.create(body);
            res.status(201).json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async update(req, res) {
        try {
            const body = { ...req.body };
            if (req.file) {
                body.feature_image = `/uploads/package-categories/${req.file.filename}`;
            } else if (body.remove_feature_image === 'true' || body.remove_feature_image === true) {
                body.feature_image = null;
            }
            // Parse buttons JSON
            if (body.buttons && typeof body.buttons === 'string') {
                try { body.buttons = JSON.parse(body.buttons); } catch(e) { body.buttons = []; }
            }
            if (body.category_id === '') body.category_id = null;
            const data = await this.packageCategoryRepo.update(req.params.id, body);
            if (!data) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async bulkDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !ids.length) return res.status(400).json({ success: false, message: 'No IDs provided' });
            await this.packageCategoryModel.destroy({ where: { id: ids } });
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await this.packageCategoryRepo.delete(req.params.id);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = PackageCategoryController;
