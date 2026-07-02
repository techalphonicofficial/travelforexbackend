const fs = require('fs');
let content = fs.readFileSync('src/routes/travelWebRoutes.js', 'utf8');

const routeOld = `router.get('/packages', async (req, res) => {
    try {
        const packages = await packageRepo.findAll();

        // return res.json(packages);
        res.render('travel/packages/index', { title: 'Packages', packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});`;

const routeNew = `router.get('/packages', async (req, res) => {
    try {
        const packagesResult = await packageRepo.findAll({ limit: 1000 });
        const packages = packagesResult.rows || packagesResult;

        // return res.json(packages);
        res.render('travel/packages/index', { title: 'Packages', packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});`;

content = content.replace(routeOld, routeNew);
fs.writeFileSync('src/routes/travelWebRoutes.js', content);
console.log("Fixed dashboard packages fetch");
