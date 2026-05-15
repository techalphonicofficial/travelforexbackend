class BannerRepository {
    constructor(Banner) {
        this.Banner = Banner;
    }

    async findAll(filters = {}) {
        return await this.Banner.findAll({
            where: filters,
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return await this.Banner.findByPk(id);
    }

    async create(data) {
        return await this.Banner.create(data);
    }

    async update(id, data) {
        const banner = await this.Banner.findByPk(id);
        if (!banner) return null;
        return await banner.update(data);
    }

    async delete(id) {
        return await this.Banner.destroy({ where: { id } });
    }
}

module.exports = BannerRepository;
