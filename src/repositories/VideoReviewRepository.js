class VideoReviewRepository {
    constructor(VideoReviewModel, PackageModel) {
        this.VideoReview = VideoReviewModel;
        this.Package = PackageModel;
    }

    async findAll() {
        return await this.VideoReview.findAll({
            include: [
                { model: this.Package, as: 'package', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findActive() {
        return await this.VideoReview.findAll({
            where: { status: true },
            include: [
                { model: this.Package, as: 'package', attributes: ['id', 'name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return await this.VideoReview.findByPk(id, {
            include: [
                { model: this.Package, as: 'package', attributes: ['id', 'name'] }
            ]
        });
    }

    async create(data) {
        return await this.VideoReview.create(data);
    }

    async update(id, data) {
        const review = await this.VideoReview.findByPk(id);
        if (review) {
            return await review.update(data);
        }
        return null;
    }

    async delete(id) {
        const review = await this.VideoReview.findByPk(id);
        if (review) {
            await review.destroy();
            return true;
        }
        return false;
    }

    async incrementLikes(id) {
        const review = await this.VideoReview.findByPk(id);
        if (review) {
            await review.increment('likes_count');
            return review.reload();
        }
        return null;
    }
}

module.exports = VideoReviewRepository;
