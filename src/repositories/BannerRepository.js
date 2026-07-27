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

    async duplicate(id) {
        const source = await this.Banner.findByPk(id);
        if (!source) return null;

        const baseTitle = `${source.title || 'Banner'} (Copy)`;
        let titleSuffix = 2;
        let duplicateTitle = baseTitle;
        while (await this.Banner.count({ where: { title: duplicateTitle } })) {
            duplicateTitle = `${baseTitle} ${titleSuffix++}`;
        }

        return await this.Banner.create({
            title: duplicateTitle,
            subtitle: source.subtitle,
            cta_text: source.cta_text,
            cta_link: source.cta_link,
            image_path: source.image_path,
            video_path: source.video_path,
            position: source.position,
            device: source.device,
            page_type: source.page_type,
            page_id: source.page_id,
            start_date: source.start_date,
            end_date: source.end_date,
            sort_order: source.sort_order,
            status: source.status
        });
    }
}

module.exports = BannerRepository;
