const { db, models: { Package, PackageDestination, PackageDay, PackageActivity, Destination } } = require('../container');

async function seed() {
    console.log('--- STARTING BALI TOUR SEEDER ---');
    let transaction;
    try {
        transaction = await db.transaction();
        // 1. Create Destinations if they don't exist
        const [ubud] = await Destination.findOrCreate({ 
            where: { name: 'Ubud' }, 
            defaults: { type: 'culture' },
            transaction 
        });
        const [kuta] = await Destination.findOrCreate({ 
            where: { name: 'Kuta' }, 
            defaults: { type: 'beach' },
            transaction 
        });

        // 2. Create Package
        const pkg = await Package.create({
            name: "Bali Tour Package",
            description: "Explore Bali with Ubud and Kuta अनुभव",
            price: 45000,
            duration_days: 5,
            status: true
        }, { transaction });

        console.log(`Created Package: ${pkg.name} (ID: ${pkg.id})`);

        // 3. Ubud Stay (nights: 3, order: 1)
        const ubudStay = await PackageDestination.create({
            package_id: pkg.id,
            destination_id: ubud.id,
            nights: 3,
            order: 1
        }, { transaction });

        const ubudDays = [
            { 
                day_number: 1, 
                title: "Arrival in Bali & Transfer to Ubud", 
                activities: [
                    { title: "Airport Pickup", description: "Pickup from Ngurah Rai Airport", time_slot: "Morning", sort_order: 1 },
                    { title: "Hotel Check-in", description: "Check-in and relax", time_slot: "Afternoon", sort_order: 2 }
                ]
            },
            { 
                day_number: 2, 
                title: "Ubud Sightseeing", 
                activities: [
                    { title: "Tegallalang Rice Terrace", time_slot: "Morning", sort_order: 1 },
                    { title: "Ubud Monkey Forest", time_slot: "Afternoon", sort_order: 2 }
                ]
            },
            { 
                day_number: 3, 
                title: "Temple Tour", 
                activities: [
                    { title: "Tirta Empul Temple", time_slot: "Morning", sort_order: 1 }
                ]
            }
        ];

        for (const d of ubudDays) {
            const day = await PackageDay.create({
                package_destination_id: ubudStay.id,
                day_number: d.day_number,
                title: d.title
            }, { transaction });

            if (d.activities && d.activities.length) {
                await PackageActivity.bulkCreate(d.activities.map(a => ({
                    ...a,
                    package_day_id: day.id
                })), { transaction });
            }
        }

        // 4. Kuta Stay (nights: 2, order: 2)
        const kutaStay = await PackageDestination.create({
            package_id: pkg.id,
            destination_id: kuta.id,
            nights: 2,
            order: 2
        }, { transaction });

        const kutaDays = [
            { 
                day_number: 1, 
                title: "Transfer to Kuta & Beach Time", 
                activities: [
                    { title: "Hotel Transfer", time_slot: "Morning", sort_order: 1 },
                    { title: "Kuta Beach Visit", time_slot: "Evening", sort_order: 2 }
                ]
            },
            { 
                day_number: 2, 
                title: "Water Sports & Leisure", 
                activities: [
                    { title: "Parasailing", time_slot: "Morning", sort_order: 1 },
                    { title: "Banana Boat Ride", time_slot: "Afternoon", sort_order: 2 }
                ]
            }
        ];

        for (const d of kutaDays) {
            const day = await PackageDay.create({
                package_destination_id: kutaStay.id,
                day_number: d.day_number,
                title: d.title
            }, { transaction });

            if (d.activities && d.activities.length) {
                await PackageActivity.bulkCreate(d.activities.map(a => ({
                    ...a,
                    package_day_id: day.id
                })), { transaction });
            }
        }

        await transaction.commit();
        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('--- SEEDING FAILED ---', err);
        process.exit(1);
    }
}

seed();
