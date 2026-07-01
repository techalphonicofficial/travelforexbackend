const { db, models } = require('./src/container');

const { HotelBooking, User, Customer, Hotel } = models;

async function main() {
  await db.authenticate();

  const hotels = await Hotel.findAll({
    include: [{ model: Hotel.sequelize.models.Destination, as: 'destination', required: false }],
    order: [['id', 'ASC']],
    limit: 6
  });
  const customers = await Customer.findAll({
    include: [{ model: User, as: 'user', required: true }],
    limit: 6
  });
  const fallbackUsers = customers.length ? [] : await User.findAll({ limit: 6 });

  if (!hotels.length) throw new Error('No hotels found. Seed hotels before hotel bookings.');
  if (!customers.length && !fallbackUsers.length) throw new Error('No users/customers found. Seed users before hotel bookings.');

  const samples = [
    { key: 'hotel-booking-seed-001', rooms: 2, note: 'Family needs connecting rooms and late check-in.' },
    { key: 'hotel-booking-seed-002', rooms: 1, note: 'Solo traveller asks for airport pickup details.' },
    { key: 'hotel-booking-seed-003', rooms: 3, note: 'Group wants breakfast included and sea-view rooms.' },
    { key: 'hotel-booking-seed-004', rooms: 2, note: 'Honeymoon request with early check-in.' },
    { key: 'hotel-booking-seed-005', rooms: 4, note: 'Corporate stay request near city centre.' }
  ];

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const hotel = hotels[index % hotels.length];
    const hotelPlain = hotel.get({ plain: true });
    const customer = customers[index % Math.max(customers.length, 1)];
    const user = customer && customer.user ? customer.user : fallbackUsers[index % fallbackUsers.length];
    const destination = hotelPlain.destination || {};
    const existing = await HotelBooking.findOne({
      where: {
        notes: { [HotelBooking.sequelize.Sequelize.Op.iLike]: `%${sample.key}%` }
      }
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const rooms = Array.from({ length: sample.rooms }, (_, roomIndex) => ({
      room_count: 1,
      adults: roomIndex === 0 ? 2 : 1,
      children: roomIndex === 0 && sample.rooms > 1 ? 1 : 0
    }));
    const commissionPercent = parseFloat(hotelPlain.commission_percent) || 0;
    const baseAmount = (parseFloat(hotelPlain.price_per_night) || 0) * sample.rooms;
    const commissionAmount = parseFloat(((baseAmount * commissionPercent) / 100).toFixed(2));

    await HotelBooking.create({
      user_id: user.id,
      customer_id: customer ? customer.id : null,
      hotel_id: hotelPlain.id,
      destination_id: destination.id || hotelPlain.destination_id || null,
      room_count: sample.rooms,
      rooms,
      total_travellers: Math.max(1, sample.rooms * 2),
      base_amount: baseAmount.toFixed(2),
      commission_percent: commissionPercent.toFixed(2),
      commission_amount: commissionAmount.toFixed(2),
      total_amount: (baseAmount + commissionAmount).toFixed(2),
      raw_payload: {
        seed_key: sample.key,
        user_id: user.id,
        hotel_id: hotelPlain.id,
        hotel_name: hotelPlain.name,
        room_count: sample.rooms,
        rooms,
        notes: sample.note,
        commission_percent: commissionPercent
      },
      status: 'new',
      notes: `${sample.key}: ${sample.note}`
    });

    created += 1;
  }

  console.log(`Hotel booking seed complete. Created ${created}, skipped ${skipped}.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
