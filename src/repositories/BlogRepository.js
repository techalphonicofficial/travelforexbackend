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
}

module.exports = BlogRepository;
