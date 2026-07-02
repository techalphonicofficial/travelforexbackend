const fs = require('fs');
let pkgRepoStr = fs.readFileSync('src/repositories/PackageRepository.js', 'utf8');

// Update findAll in PackageRepository
pkgRepoStr = pkgRepoStr.replace(/async findAll\(\) \{([\s\S]*?)return this\.model\.findAll\(\{([\s\S]*?)order: \[\['created_at', 'DESC'\]\]\s*\}\);\s*\}/, (match, p1, p2) => {
    return `async findAll({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({${p2}order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
    }`;
});

// Remove activities from packageDestinationModel in findAll
pkgRepoStr = pkgRepoStr.replace(/model: this\.packageDestinationModel, as: 'destinations',\s*include: \[\{ model: this\.destinationModel, as: 'destination' \}\]/g, "model: this.packageDestinationModel, as: 'destinations', attributes: { exclude: ['activities'] }, include: [{ model: this.destinationModel, as: 'destination' }]");

// Update filterPackages in PackageRepository
pkgRepoStr = pkgRepoStr.replace(/async filterPackages\(\{([\s\S]*?)\}\) \{/, "async filterPackages({ page = 1, limit = 10, $1 }) {");

pkgRepoStr = pkgRepoStr.replace(/return this\.model\.findAll\(\{\s*where,\s*include: includes,\s*order: \[\['created_at', 'DESC'\]\]\s*\}\);/, `const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            where,
            include: includes,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });`);

fs.writeFileSync('src/repositories/PackageRepository.js', pkgRepoStr);


let pkgRoutesStr = fs.readFileSync('src/routes/packageRoutes.js', 'utf8');

// Update swagger in packageRoutes
const swaggerPageLimit = ` *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page`;

pkgRoutesStr = pkgRoutesStr.replace(/ \*     responses:/, `${swaggerPageLimit}\n *     responses:`);

// Update swagger response format
pkgRoutesStr = pkgRoutesStr.replace(/ \*                 data:\n \*                   type: array/, ` *                 total:\n *                   type: integer\n *                 totalPages:\n *                   type: integer\n *                 currentPage:\n *                   type: integer\n *                 data:\n *                   type: array`);

// Update route handler
pkgRoutesStr = pkgRoutesStr.replace(/const \{ minPrice, maxPrice(.*?) \} = req\.query;/, "const { page = 1, limit = 10, minPrice, maxPrice$1 } = req.query;");
pkgRoutesStr = pkgRoutesStr.replace(/data = await packageRepo\.filterPackages\(\{ minPrice, maxPrice(.*?) \}\);/, "data = await packageRepo.filterPackages({ page, limit, minPrice, maxPrice$1 });");
pkgRoutesStr = pkgRoutesStr.replace(/data = await packageRepo\.findAll\(\);/, "data = await packageRepo.findAll({ page, limit });");
pkgRoutesStr = pkgRoutesStr.replace(/res\.json\(\{ success: true, data \}\);/, "res.json({ success: true, data: data.rows, total: data.count, currentPage: parseInt(page), totalPages: Math.ceil(data.count / limit) });");


fs.writeFileSync('src/routes/packageRoutes.js', pkgRoutesStr);

console.log("Done");
