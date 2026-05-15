class BlogRepository {
    constructor(BlogPost, BlogCategory) {
        this.BlogPost = BlogPost;
        this.BlogCategory = BlogCategory;
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
            include: [{ model: this.BlogCategory, as: 'category' }],
            order: [['created_at', 'DESC']]
        });
    }

    async findPostById(id) {
        return await this.BlogPost.findByPk(id, {
            include: [{ model: this.BlogCategory, as: 'category' }]
        });
    }

    async findPostBySlug(slug) {
        return await this.BlogPost.findOne({
            where: { slug },
            include: [{ model: this.BlogCategory, as: 'category' }]
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
