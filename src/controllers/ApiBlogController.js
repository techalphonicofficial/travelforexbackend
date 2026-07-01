class ApiBlogController {
    constructor(blogRepo) {
        this.blogRepo = blogRepo;
    }

    async getBlogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const postsData = await this.blogRepo.findPaginatedPosts({ status: 'published' }, limit, offset);
            
            res.json({ 
                success: true, 
                data: postsData.rows,
                pagination: {
                    totalItems: postsData.count,
                    currentPage: page,
                    totalPages: Math.ceil(postsData.count / limit),
                    limit: limit
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getBlogBySlug(req, res) {
        try {
            const post = await this.blogRepo.findPostBySlug(req.params.slug);
            if (!post || post.status !== 'published') {
                return res.status(404).json({ success: false, message: 'Blog post not found' });
            }
            res.json({ success: true, data: post });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getRelatedBlogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            // Find the current post first to get its category ID
            const post = await this.blogRepo.findPostBySlug(req.params.slug);
            
            if (!post || post.status !== 'published') {
                return res.status(404).json({ success: false, message: 'Blog post not found' });
            }

            const relatedPosts = await this.blogRepo.findRelatedPosts(post.id, post.category_id, limit);
            res.json({ success: true, data: relatedPosts });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = ApiBlogController;
