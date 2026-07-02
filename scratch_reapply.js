const fs = require('fs');

let repoStr = fs.readFileSync('src/repositories/PackageRepository.js', 'utf8');

const findAllOld = `    async findAll() {
        return this.model.findAll({
            include: [
                { 
                    model: this.packageDestinationModel, as: 'destinations',
                    include: [{ model: this.destinationModel, as: 'destination' }]
                },
                { model: this.mediaModel, as: 'gallery' },
                { association: 'package_categories' }
            ],
            order: [['created_at', 'DESC']]
        });
    }`;

const findAllNew = findAllOld + `\n
    async findAllPaginated({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            include: [
                { 
                    model: this.packageDestinationModel, as: 'destinations', attributes: { exclude: ['activities'] }, include: [{ model: this.destinationModel, as: 'destination' }]
                },
                { model: this.mediaModel, as: 'gallery' },
                { association: 'package_categories' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
    }`;

repoStr = repoStr.replace(findAllOld, findAllNew);

const filterOld = `    async filterPackages({ minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug }) {`;
const filterNew = `    async filterPackages({ page = 1, limit = 10, minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug }) {`;

repoStr = repoStr.replace(filterOld, filterNew);

const pkgDestIncludeOld = `        const pkgDestInclude = {
            model: this.packageDestinationModel, as: 'destinations',
            include: [destIncludeOptions],
            required: destIncludeOptions.required
        };`;
const pkgDestIncludeNew = `        const pkgDestInclude = {
            model: this.packageDestinationModel, as: 'destinations',
            attributes: { exclude: ['activities'] },
            include: [destIncludeOptions],
            required: destIncludeOptions.required
        };`;

repoStr = repoStr.replace(pkgDestIncludeOld, pkgDestIncludeNew);

const filterReturnOld = `        return this.model.findAll({
            where,
            include: includes,
            order: [['created_at', 'DESC']]
        });`;
const filterReturnNew = `        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            where,
            include: includes,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });`;

repoStr = repoStr.replace(filterReturnOld, filterReturnNew);

fs.writeFileSync('src/repositories/PackageRepository.js', repoStr);


let routesStr = fs.readFileSync('src/routes/packageRoutes.js', 'utf8');

const routeOld = `router.get('/', async (req, res) => {
    try {
        const { minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug } = req.query;
        let data;
        if (minPrice || maxPrice || duration || startDate || endDate || city || country || continent || destination || category || package_category_slug) {
            data = await packageRepo.filterPackages({ minPrice, maxPrice, duration, startDate, endDate, city, country, continent, destination, category, package_category_slug });
        } else {
            data = await packageRepo.findAll();
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});`;

const routeNew = `router.get('/', async (req, res) => {
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
});`;

routesStr = routesStr.replace(routeOld, routeNew);

const swaggerParamsOld = ` *       - in: query
 *         name: package_category_slug
 *         schema:
 *           type: string
 *         description: Package category slug filter
 *     responses:`;

const swaggerParamsNew = ` *       - in: query
 *         name: package_category_slug
 *         schema:
 *           type: string
 *         description: Package category slug filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:`;

routesStr = routesStr.replace(swaggerParamsOld, swaggerParamsNew);

const swaggerResponseOld = ` *                 data:
 *                   type: array`;
const swaggerResponseNew = ` *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array`;

routesStr = routesStr.replace(swaggerResponseOld, swaggerResponseNew);

fs.writeFileSync('src/routes/packageRoutes.js', routesStr);
console.log("Done");
