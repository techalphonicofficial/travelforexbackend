class CategoryController {
    constructor(categoryRepo, categoryModel, db) {
        this.categoryRepo = categoryRepo;
        this.categoryModel = categoryModel;
        this.db = db;
    }

    async getAll(req, res) {
        try {
            const data = await this.categoryRepo.findAll();

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
 async getHome(req, res) {
        try {
            const data = await this.categoryRepo.findhome();
            
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getTourTypes(req, res) {
        try {
            const data = await this.categoryRepo.findTourTypes();

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getMenuTourTypes(req, res) {
        try {
            const data = await this.categoryRepo.findMenuTourTypes();

            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getById(req, res) {
        try {
            const data = await this.categoryRepo.findById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async create(req, res) {
        try {
            const body = { ...req.body };
            if (body.show_in_menu !== undefined) body.show_in_menu = body.show_in_menu === true || body.show_in_menu === 'true' || body.show_in_menu === 1 || body.show_in_menu === '1';
            if (body.show_in_sidebar !== undefined) body.show_in_sidebar = body.show_in_sidebar === true || body.show_in_sidebar === 'true' || body.show_in_sidebar === 1 || body.show_in_sidebar === '1';
            if (body.show_in_home !== undefined) body.show_in_home = body.show_in_home === true || body.show_in_home === 'true' || body.show_in_home === 1 || body.show_in_home === '1';
            if (body.is_customizable !== undefined) body.is_customizable = body.is_customizable === true || body.is_customizable === 'true' || body.is_customizable === 1 || body.is_customizable === '1';
            if (body.is_tour_type !== undefined) body.is_tour_type = body.is_tour_type === true || body.is_tour_type === 'true' || body.is_tour_type === 1 || body.is_tour_type === '1';
            
            if (req.file) {
                body.feature_image = `/uploads/categories/${req.file.filename}`;
            }

            const data = await this.categoryRepo.create(body);
            res.status(201).json({ success: true, data });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async update(req, res) {
        try {
            const body = { ...req.body };
            if (body.show_in_menu !== undefined) body.show_in_menu = body.show_in_menu === true || body.show_in_menu === 'true' || body.show_in_menu === 1 || body.show_in_menu === '1';
            if (body.show_in_sidebar !== undefined) body.show_in_sidebar = body.show_in_sidebar === true || body.show_in_sidebar === 'true' || body.show_in_sidebar === 1 || body.show_in_sidebar === '1';
            if (body.show_in_home !== undefined) body.show_in_home = body.show_in_home === true || body.show_in_home === 'true' || body.show_in_home === 1 || body.show_in_home === '1';
            if (body.is_customizable !== undefined) body.is_customizable = body.is_customizable === true || body.is_customizable === 'true' || body.is_customizable === 1 || body.is_customizable === '1';
            if (body.is_tour_type !== undefined) body.is_tour_type = body.is_tour_type === true || body.is_tour_type === 'true' || body.is_tour_type === 1 || body.is_tour_type === '1';

            if (req.file) {
                body.feature_image = `/uploads/categories/${req.file.filename}`;
            } else if (body.remove_feature_image === 'true' || body.remove_feature_image === true) {
                body.feature_image = null;
            }

            const data = await this.categoryRepo.update(req.params.id, body);
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
            await this.categoryModel.destroy({ where: { id: ids } });
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await this.categoryRepo.delete(req.params.id);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async reorder(req, res) {
        try {
            const { order } = req.body; // Expects [{id, sort_order}, ...]
            if (!order || !Array.isArray(order)) return res.status(400).json({ success: false, message: 'Invalid data' });
            
            await this.db.transaction(async (t) => {
                for (const item of order) {
                    await this.categoryModel.update({ sort_order: item.sort_order }, { where: { id: item.id }, transaction: t });
                }
            });
            
            res.json({ success: true, message: 'Reordered successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = CategoryController;
