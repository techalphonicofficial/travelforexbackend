const sequelize = require('../database');
const BlogPost = require('../models/BlogPost');
const BlogCategory = require('../models/BlogCategory');
const BlogDetail = require('../models/BlogDetail');
const User = require('../models/User');

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Ensure tables/associations exist

        // Find or create an author
        let author = await User.findOne({ where: { role_id: 1 } }); // Admin/Employee
        const authorId = author ? author.id : null;

        // Create category
        const [category] = await BlogCategory.findOrCreate({
            where: { slug: 'general-travel' },
            defaults: {
                name: 'General Travel',
                description: 'Various travel experiences.'
            }
        });

        console.log('Generating 1000 blogs... This may take a moment.');

        const posts = [];
        const now = new Date();
        for (let i = 1; i <= 1000; i++) {
            posts.push({
                category_id: category.id,
                author_id: authorId,
                title: `Awesome Travel Blog Post ${i}`,
                slug: `awesome-travel-blog-post-${i}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                summary: `This is a short summary for travel blog post number ${i}. Exploring the world one step at a time.`,
                content: `<p>Welcome to our travel blog post ${i}. Here is some amazing content about traveling to new destinations.</p><ul><li>Pack light</li><li>Travel far</li></ul>`,
                meta_title: `Awesome Travel Blog Post ${i} - PickTrails`,
                meta_description: `Read about awesome travel experiences in post number ${i}.`,
                meta_keywords: `travel, blog, post ${i}`,
                status: 'published',
                published_at: now,
                is_featured: i % 100 === 0 ? 1 : 0
            });
        }

        // Bulk insert blogs to be fast
        const createdPosts = await BlogPost.bulkCreate(posts, { returning: true });
        
        console.log(`Successfully seeded 1000 blogs. Creating details for the first 10 blogs...`);

        // Create details for just the first 10 to save time
        const details = [];
        for (let i = 0; i < 10; i++) {
            details.push({
                blog_id: createdPosts[i].id,
                image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=800',
                alt_text: 'Sample Travel Image',
                content: `<h3>Detail for Post ${i+1}</h3><p>Detailed section explaining the amazing journey.</p>`
            });
        }
        await BlogDetail.bulkCreate(details);

        console.log('Blog seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding blogs:', err);
        process.exit(1);
    }
}

seed();
