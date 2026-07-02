const fs = require('fs');
let code = fs.readFileSync('src/routes/packageRoutes.js', 'utf8');

const brokenStr = ` *                   items:

/**
 * @swagger
 * /api/v1/packages/filters:`;

const fixedStr = ` *                   items:
 *                     $ref: '#/components/schemas/Package'
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug } = req.query;
        let data;
        if (minPrice || maxPrice || duration || startDate || endDate || city || country || continent || destination || category || package_category_slug) {
            data = await packageRepo.filterPackages({ page, limit, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug });
        } else {
            data = await packageRepo.findAllPaginated({ page, limit });
        }
        res.json({ success: true, data: data.rows, total: data.count, currentPage: parseInt(page), totalPages: Math.ceil(data.count / limit) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/packages/filters:`;

code = code.replace(brokenStr, fixedStr);
fs.writeFileSync('src/routes/packageRoutes.js', code);
console.log("Done");
