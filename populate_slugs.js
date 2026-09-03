const { Destination } = require('./src/container').models;

async function populateSlugs() {
  try {
    const destinations = await Destination.findAll();


    for (const dest of destinations) {
      if (!dest.slug) {
        const slug = dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await dest.update({ slug });

      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error updating slugs:', err);
    process.exit(1);
  }
}

populateSlugs();
