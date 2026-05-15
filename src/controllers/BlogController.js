class BlogController {
    constructor(blogRepo, mediaRepo) {
        this.blogRepo = blogRepo;
        this.mediaRepo = mediaRepo;
    }

    // Categories
    async listCategories(req, res) {
        try {
            const categories = await this.blogRepo.findAllCategories();
            res.render('cms/blog/categories/index', { title: 'Blog Categories', categories });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async storeCategory(req, res) {
        try {
            await this.blogRepo.createCategory(req.body);
            res.redirect('/cms/blog/categories');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    // Posts
    async index(req, res) {
        try {
            const posts = await this.blogRepo.findAllPosts();
            res.render('cms/blog/posts/index', { title: 'Blog Posts', posts });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async create(req, res) {
        try {
            const categories = await this.blogRepo.findAllCategories();
            res.render('cms/blog/posts/form', { title: 'New Blog Post', post: null, categories });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async edit(req, res) {
        try {
            const post = await this.blogRepo.findPostById(req.params.id);
            const categories = await this.blogRepo.findAllCategories();
            if (!post) return res.status(404).send('Post not found');
            res.render('cms/blog/posts/form', { title: 'Edit Blog Post', post, categories });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async store(req, res) {
        try {
            const data = req.body;
            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/blog/${req.file.filename}`;
                data.featured_image = imagePath;
            }
            if (!data.slug) data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const post = await this.blogRepo.createPost(data);

            if (imagePath) {
                await this.mediaRepo.create({
                    entity_type: 'blog_post',
                    entity_id: post.id,
                    url: imagePath,
                    is_primary: true
                });
            }
            res.redirect('/cms/blog/posts');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async update(req, res) {
        try {
            const data = req.body;
            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/blog/${req.file.filename}`;
                data.featured_image = imagePath;
            }
            await this.blogRepo.updatePost(req.params.id, data);

            if (imagePath) {
                await this.mediaRepo.deleteByEntity('blog_post', req.params.id);
                await this.mediaRepo.create({
                    entity_type: 'blog_post',
                    entity_id: req.params.id,
                    url: imagePath,
                    is_primary: true
                });
            }
            res.redirect('/cms/blog/posts');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async delete(req, res) {
        try {
            await this.blogRepo.deletePost(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Public Views
    async renderPublicList(req, res) {
        try {
            const posts = await this.blogRepo.findAllPosts({ status: 'published' });
            res.render('public/blog/list', { title: 'Our Blog', posts, layout: 'layouts/public' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async renderPublicPost(req, res) {
        try {
            const post = await this.blogRepo.findPostBySlug(req.params.slug);
            if (!post) return res.status(404).send('Post not found');
            res.render('public/blog/show', { title: post.title, post, layout: 'layouts/public' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}

module.exports = BlogController;
