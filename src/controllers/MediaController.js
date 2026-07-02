class MediaController {
    constructor(mediaRepo) {
        this.mediaRepo = mediaRepo;
    }

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const media = await this.mediaRepo.Media.findAll({
                order: [['created_at', 'DESC']],
                limit: limit,
                offset: offset
            });
            const total = await this.mediaRepo.Media.count();
            const hasMore = offset + media.length < total;

            res.json({ success: true, data: media, hasMore, page, total });
        } catch (err) {
            console.error('[MediaController.getAll] Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async upload(req, res) {
        try {
            if (!req.file) throw new Error('No file uploaded');
            const url = `/uploads/media/${req.file.filename}`;
            console.log('[MediaController.upload] Uploaded File:', req.file);
            const media = await this.mediaRepo.create({
                entity_type: req.body.entity_type || 'page',
                entity_id: req.body.entity_id || 0,
                url,
                media_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
                label: req.body.label || req.file.originalname
            });
            res.json({ success: true, data: media });
        } catch (err) {
            console.error('[MediaController.upload] Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = MediaController;
