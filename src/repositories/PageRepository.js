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

    async duplicate(id) {
        const source = await this.Page.findByPk(id, {
            include: [{ model: this.PageDetail, as: 'details' }]
        });
        if (!source) return null;

        const baseTitle = `${source.title} (Copy)`;
        const baseSlug = `${source.slug}-copy`;
        let titleSuffix = 2;
        let slugSuffix = 2;

        let duplicateTitle = baseTitle;
        while (await this.Page.count({ where: { title: duplicateTitle } })) {
            duplicateTitle = `${baseTitle} ${titleSuffix++}`;
        }

        let duplicateSlug = baseSlug;
        while (await this.Page.count({ where: { slug: duplicateSlug } })) {
            duplicateSlug = `${baseSlug}-${slugSuffix++}`;
        }

        const transaction = await this.Page.sequelize.transaction();
        try {
            const page = await this.Page.create({
                title: duplicateTitle,
                slug: duplicateSlug,
                description: source.description,
                meta_title: source.meta_title ? `${source.meta_title} (Copy)` : null,
                meta_description: source.meta_description,
                feature_image: source.feature_image,
                alt_text: source.alt_text,
                keyword: source.keyword,
                schema: source.schema
            }, { transaction });

            if (source.details && source.details.length > 0) {
                const details = source.details.map(detail => {
                    let jsonData = detail.json_data;
                    if (typeof jsonData === 'string') {
                        try {
                            jsonData = JSON.parse(jsonData);
                        } catch (e) {}
                    }
                    return {
                        page_id: page.id,
                        section: detail.section,
                        key: detail.key,
                        title: detail.title,
                        description: detail.description,
                        image: detail.image,
                        json_data: jsonData
                    };
                });
                await this.PageDetail.bulkCreate(details, { transaction });
            }

            await transaction.commit();
            return page;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = PageRepository;
