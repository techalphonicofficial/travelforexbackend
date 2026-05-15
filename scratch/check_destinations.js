const { Destination } = require('../src/container').models;

async function check() {
    try {
        const count = await Destination.count();
        console.log('Total Destinations:', count);
        const all = await Destination.findAll({ limit: 5 });
        console.log('Sample Destinations:', all.map(d => ({ id: d.id, name: d.name })));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
