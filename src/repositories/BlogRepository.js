class BlogRepository {
    constructor(BlogPost, BlogCategory, BlogDetail, User) {
        this.BlogPost = BlogPost;
        this.BlogCategory = BlogCategory;
        this.BlogDetail = BlogDetail;
        this.User = User;
    }

    // Categories
    async findAllCategories() {
        return await this.BlogCategory.findAll();
    }

    async findCategoryById(id) {
        return await this.BlogCategory.findByPk(id);
    }

    async createCategory(data) {
        return await this.BlogCategory.create(data);
    }

    async updateCategory(id, data) {
        const cat = await this.BlogCategory.findByPk(id);
        if (!cat) return null;
        return await cat.update(data);
    }

    // Posts
    async findAllPosts(filters = {}) {
        return await this.BlogPost.findAll({
            where: filters,
            include: [
                { model: this.BlogCategory, as: 'category' },
                { model: this.User, as: 'author', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findPaginatedPosts(filters = {}, limit = 10, offset = 0) {
        return await this.BlogPost.findAndCountAll({
            where: filters,
            include: [
                { model: this.BlogCategory, as: 'category' },
                { model: this.BlogDetail, as: 'details' },
                { model: this.User, as: 'author', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
            distinct: true
        });
    }

    async findPostById(id) {
        return await this.BlogPost.findByPk(id, {
            include: [
                { model: this.BlogCategory, as: 'category' },
                { model: this.BlogDetail, as: 'details' },
                { model: this.User, as: 'author', attributes: ['id', 'name', 'email'] }
            ]
        });
    }

    async findPostBySlug(slug) {
        return await this.BlogPost.findOne({
            where: { slug },
            include: [
                { model: this.BlogCategory, as: 'category' },
                { model: this.BlogDetail, as: 'details' },
                { model: this.User, as: 'author', attributes: ['id', 'name', 'email'] }
            ]
        });
    }

    async findRelatedPosts(currentPostId, categoryId, limit = 3) {
        const { Op } = require('sequelize');
        return await this.BlogPost.findAll({
            where: {
                id: { [Op.ne]: currentPostId },
                category_id: categoryId,
                status: 'published'
            },
            limit,
            order: [['created_at', 'DESC']],
            include: [
                { model: this.BlogCategory, as: 'category' },
                { model: this.User, as: 'author', attributes: ['id', 'name', 'email'] }
            ]
        });
    }

    async createPost(data) {
        return await this.BlogPost.create(data);
    }

    async updatePost(id, data) {
        const post = await this.BlogPost.findByPk(id);
        if (!post) return null;
        return await post.update(data);
    }

    async deletePost(id) {
        return await this.BlogPost.destroy({ where: { id } });
    }

    async duplicatePost(id) {
        const source = await this.BlogPost.findByPk(id, {
            include: [{ model: this.BlogDetail, as: 'details' }]
        });
        if (!source) return null;

        const baseTitle = `${source.title} (Copy)`;
        const baseSlug = `${source.slug}-copy`;
        let titleSuffix = 2;
        let slugSuffix = 2;

        let duplicateTitle = baseTitle;
        while (await this.BlogPost.count({ where: { title: duplicateTitle } })) {
            duplicateTitle = `${baseTitle} ${titleSuffix++}`;
        }

        let duplicateSlug = baseSlug;
        while (await this.BlogPost.count({ where: { slug: duplicateSlug } })) {
            duplicateSlug = `${baseSlug}-${slugSuffix++}`;
        }

        const transaction = await this.BlogPost.sequelize.transaction();
        try {
            const post = await this.BlogPost.create({
                category_id: source.category_id,
                author_id: source.author_id,
                title: duplicateTitle,
                slug: duplicateSlug,
                summary: source.summary,
                content: source.content,
                featured_image: source.featured_image,
                meta_title: source.meta_title ? `${source.meta_title} (Copy)` : null,
                meta_description: source.meta_description,
                meta_keywords: source.meta_keywords,
                schema_markup: source.schema_markup,
                status: 'draft',
                is_featured: source.is_featured
            }, { transaction });

            if (source.details && source.details.length > 0) {
                const details = source.details.map(detail => ({
                    blog_id: post.id,
                    image: detail.image,
                    alt_text: detail.alt_text,
                    content: detail.content
                }));
                await this.BlogDetail.bulkCreate(details, { transaction });
            }

            await transaction.commit();
            return post;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = BlogRepository;
