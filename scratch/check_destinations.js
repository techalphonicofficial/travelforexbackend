const { Destination } = require('../src/container').models;

async function check() {
    try {
        const count = await Destination.count();

        const all = await Destination.findAll({ limit: 5 });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
