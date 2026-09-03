const { Package, PackageDestination, Destination } = require('../src/container').models;

async function check() {
    try {
        const pkgs = await Package.findAll({
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    include: [{ model: Destination, as: 'destination' }]
                }
            ]
        });


        pkgs.forEach(p => {


        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
