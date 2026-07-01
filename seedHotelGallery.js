const { db, models } = require('./src/container');

const PROVIDER_NAME = 'Seed Hotels';
const GALLERY_SIZE = 3;

const imagePool = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80'
];

async function seedHotelGallery() {
  await db.authenticate();

  const hotels = await models.Hotel.findAll({
    where: { provider_name: PROVIDER_NAME },
    attributes: ['id', 'name', 'image_url'],
    order: [['id', 'ASC']]
  });

  if (!hotels.length) {
    console.log('No seed hotels found. Run node seedHotels.js first.');
    return;
  }

  let created = 0;

  for (const hotel of hotels) {
    const existing = await models.Media.findAll({
      where: {
        entity_type: 'hotel',
        entity_id: hotel.id
      },
      order: [
        ['is_primary', 'DESC'],
        ['id', 'ASC']
      ]
    });

    if (existing.length >= GALLERY_SIZE) continue;

    const needsPrimary = !existing.some(media => media.is_primary);
    const remaining = GALLERY_SIZE - existing.length;
    const rows = [];

    for (let i = 0; i < remaining; i++) {
      const mediaIndex = existing.length + i;
      const imageUrl = imagePool[(hotel.id + mediaIndex) % imagePool.length];
      rows.push({
        entity_type: 'hotel',
        entity_id: hotel.id,
        url: `${imageUrl}&hotel=${hotel.id}&image=${mediaIndex + 1}`,
        alt_text: `${hotel.name} gallery ${mediaIndex + 1}`,
        media_type: 'image',
        is_primary: needsPrimary && i === 0
      });
    }

    const inserted = await models.Media.bulkCreate(rows, { returning: true });
    created += inserted.length;

    if (!hotel.image_url) {
      const primary = existing.find(media => media.is_primary) || inserted.find(media => media.is_primary) || inserted[0];
      if (primary) await hotel.update({ image_url: primary.url });
    }
  }

  console.log(`Created ${created} hotel gallery media rows.`);
}

seedHotelGallery()
  .catch(error => {
    console.error('Failed to seed hotel gallery:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
