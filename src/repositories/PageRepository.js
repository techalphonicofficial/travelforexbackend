class PageRepository {
    constructor(Page, PageDetail) {
        this.Page = Page;
        this.PageDetail = PageDetail;
    }

    async findAll() {
        return await this.Page.findAll({
            include: [{ model: this.PageDetail, as: 'details' }]
        });
    }

    async findBySlug(slug) {
        return await this.Page.findOne({
            where: { slug },
            include: [{ model: this.PageDetail, as: 'details' }]
        });
    }

    async findById(id) {
        return await this.Page.findByPk(id, {
            include: [{ model: this.PageDetail, as: 'details' }]
        });
    }

    async create(data) {
        return await this.Page.create(data);
    }

    async update(id, data) {
        const page = await this.Page.findByPk(id);
        if (!page) return null;
        return await page.update(data);
    }

    async delete(id) {
        return await this.Page.destroy({ where: { id } });
    }
}

module.exports = PageRepository;
