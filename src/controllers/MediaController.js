const fs = require('fs');
const path = require('path');
const { Op, Sequelize } = require('sequelize');

class MediaController {
    constructor(mediaRepo) {
        this.mediaRepo = mediaRepo;
    }

    async getAll(req, res) {
        try {
            const page   = parseInt(req.query.page)  || 1;
            const limit  = parseInt(req.query.limit) || 24;
            const offset = (page - 1) * limit;
            const search = (req.query.search || '').trim();
            const type   = (req.query.type   || '').trim(); // 'image' | 'video' | ''

            const searchBase    = search.replace(/\.[a-z0-9]+$/i, '');
            const compactSearch = search.toLowerCase().replace(/[^a-z0-9]/g, '');
            const compactField  = Sequelize.fn(
                'regexp_replace',
                Sequelize.fn('lower',
                    Sequelize.fn('concat',
                        Sequelize.fn('coalesce', Sequelize.col('label'),    ''), ' ',
                        Sequelize.fn('coalesce', Sequelize.col('alt_text'), ''), ' ',
                        Sequelize.fn('coalesce', Sequelize.col('url'),      '')
                    )
                ), '[^a-z0-9]', '', 'g'
            );

            const conditions = [];

            // Text search
            if (search) {
                conditions.push({
                    [Op.or]: [
                        { label:    { [Op.iLike]: `%${search}%` } },
                        { alt_text: { [Op.iLike]: `%${search}%` } },
                        { url:      { [Op.iLike]: `%${search}%` } },
                        ...(searchBase && searchBase !== search ? [
                            { label:    { [Op.iLike]: `%${searchBase}%` } },
                            { alt_text: { [Op.iLike]: `%${searchBase}%` } },
                            { url:      { [Op.iLike]: `%${searchBase}%` } }
                        ] : []),
                        ...(compactSearch ? [
                            Sequelize.where(compactField, { [Op.like]: `%${compactSearch}%` })
                        ] : [])
                    ]
                });
            }

            // Type filter (image vs video)
            if (type === 'image') {
                conditions.push({
                    url: { [Op.notILike]: '%.mp4' },
                    [Op.and]: [
                        { url: { [Op.notILike]: '%.webm' } },
                        { url: { [Op.notILike]: '%.ogg'  } },
                        { url: { [Op.notILike]: '%.mov'  } },
                        { url: { [Op.notILike]: '%.avi'  } }
                    ]
                });
            } else if (type === 'video') {
                conditions.push({
                    [Op.or]: [
                        { url: { [Op.iLike]: '%.mp4'  } },
                        { url: { [Op.iLike]: '%.webm' } },
                        { url: { [Op.iLike]: '%.ogg'  } },
                        { url: { [Op.iLike]: '%.mov'  } },
                        { url: { [Op.iLike]: '%.avi'  } }
                    ]
                });
            }

            const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

            const media = await this.mediaRepo.Media.findAll({
                where,
                order: [['created_at', 'DESC']],
                limit,
                offset
            });
            const total  = await this.mediaRepo.Media.count({ where });
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

            const media = await this.mediaRepo.create({
                entity_type: req.body.entity_type || 'page',
                entity_id:   req.body.entity_id   || 0,
                url,
                media_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
                label:      req.body.label || req.file.originalname
            });
            res.json({ success: true, data: media });
        } catch (err) {
            console.error('[MediaController.upload] Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }


    async delete(req, res) {
        try {
            const media = await this.mediaRepo.Media.findByPk(req.params.id);
            if (!media) {
                return res.status(404).json({ success: false, message: 'Media not found' });
            }

            const publicRoot = path.resolve(__dirname, '..', '..', 'public');
            const relativeUrl = String(media.url || '').replace(/^\/+/, '');
            const filePath = path.resolve(publicRoot, relativeUrl);

            await media.destroy();

            if (filePath.startsWith(publicRoot) && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error('[MediaController.delete] Failed to delete file on disk:', e.message);
                }
            }

            res.json({ success: true, message: 'Media deleted successfully' });
        } catch (err) {
            console.error('[MediaController.delete] Error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = MediaController;
