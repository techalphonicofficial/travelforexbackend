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

        console.log('Total Packages:', pkgs.length);
        pkgs.forEach(p => {
            console.log(`Package: ${p.name} (#${p.id})`);
            console.log('Destinations:', p.destinations.map(d => ({
                id: d.id,
                destId: d.destination_id,
                destName: d.destination ? d.destination.name : 'NULL'
            })));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
