'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add slug to pages
    const tableInfo = await queryInterface.describeTable('pages');
    if (!tableInfo.slug) {
      await queryInterface.addColumn('pages', 'slug', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'temporary-slug' // Temp value for existing records
      });
    }

    // 2. Create banners
    await queryInterface.createTable('banners', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: true },
      subtitle: { type: Sequelize.STRING, allowNull: true },
      cta_text: { type: Sequelize.STRING, allowNull: true },
      cta_link: { type: Sequelize.STRING, allowNull: true },
      image_path: { type: Sequelize.STRING, allowNull: true },
      video_path: { type: Sequelize.STRING, allowNull: true },
      position: { type: Sequelize.ENUM('top', 'middle', 'sidebar', 'footer'), defaultValue: 'top' },
      device: { type: Sequelize.ENUM('all', 'desktop', 'mobile'), defaultValue: 'all' },
      page_type: { type: Sequelize.STRING, allowNull: true },
      page_id: { type: Sequelize.BIGINT, allowNull: true },
      start_date: { type: Sequelize.DATE, allowNull: true },
      end_date: { type: Sequelize.DATE, allowNull: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.SMALLINT, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. Create blog_categories
    await queryInterface.createTable('blog_categories', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.SMALLINT, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 4. Create blog_posts
    await queryInterface.createTable('blog_posts', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      category_id: { type: Sequelize.BIGINT, allowNull: false },
      author_id: { type: Sequelize.BIGINT, allowNull: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      summary: { type: Sequelize.TEXT, allowNull: true },
      content: { type: Sequelize.TEXT, allowNull: true },
      featured_image: { type: Sequelize.STRING, allowNull: true },
      meta_title: { type: Sequelize.STRING, allowNull: true },
      meta_description: { type: Sequelize.TEXT, allowNull: true },
      meta_keywords: { type: Sequelize.STRING, allowNull: true },
      schema_markup: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('draft', 'published', 'scheduled'), defaultValue: 'draft' },
      published_at: { type: Sequelize.DATE, allowNull: true },
      is_featured: { type: Sequelize.SMALLINT, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 5. Create brands
    await queryInterface.createTable('brands', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      logo_url: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 6. Create products
    await queryInterface.createTable('products', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      base_price: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      discount_type: { type: Sequelize.ENUM('amount', 'percent'), allowNull: true },
      discount_value: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      vendor_id: { type: Sequelize.BIGINT, allowNull: true },
      brand_id: { type: Sequelize.BIGINT, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'inactive', 'out_of_stock'), defaultValue: 'active' },
      is_returnable: { type: Sequelize.BOOLEAN, defaultValue: true },
      return_window_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_free_shipping: { type: Sequelize.BOOLEAN, defaultValue: false },
      shipping_charge: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
      meta_title: { type: Sequelize.STRING, allowNull: true },
      meta_description: { type: Sequelize.TEXT, allowNull: true },
      meta_keywords: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('brands');
    await queryInterface.dropTable('blog_posts');
    await queryInterface.dropTable('blog_categories');
    await queryInterface.dropTable('banners');
    await queryInterface.removeColumn('pages', 'slug');
  }
};
