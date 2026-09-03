const sequelize = require('../src/database');
const bcrypt = require('bcryptjs');
const { User, Package, Wallet, WalletTransaction, Destination, PackageDestination } = require('../src/container').models;

const seedVendor = async () => {
    try {


        // 1. Create Vendor User
        const hashedPassword = await bcrypt.hash('vendor123', 10);
        const [vendor, created] = await User.findOrCreate({
            where: { email: 'vendor@example.com' },
            defaults: {
                name: 'Premium Travels',
                password: hashedPassword,
                type: 'vendor',
                status: true
            }
        });

        // 2. Create Wallet for Vendor
        const [wallet] = await Wallet.findOrCreate({
            where: { user_id: vendor.id },
            defaults: {
                balance: 5000.00,
                currency: 'INR'
            }
        });


        // 3. Add some transactions
        await WalletTransaction.findOrCreate({
            where: { reference_id: 'INIT_BONUS' },
            defaults: {
                wallet_id: wallet.id,
                amount: 5000.00,
                type: 'credit',
                description: 'Joining Bonus',
                status: 'completed',
                reference_id: 'INIT_BONUS'
            }
        });

        // 4. Create some packages for this vendor
        const pkgData = [
            { name: 'Vendor Special: Kerala Backwaters', duration_days: 5, price: 15000, vendor_id: vendor.id, status: true },
            { name: 'Vendor Special: Shimla Snow Tour', duration_days: 3, price: 8000, vendor_id: vendor.id, status: true },
            { name: 'Vendor Special: Rajasthan Heritage', duration_days: 7, price: 25000, vendor_id: vendor.id, status: false }
        ];

        // Get some destinations to link
        const availableDestinations = await Destination.findAll({ limit: 10 });
        if (availableDestinations.length < 2) {

        }

        for (const p of pkgData) {
            const [pkg, created] = await Package.findOrCreate({
                where: { name: p.name },
                defaults: p
            });

            if (created && availableDestinations.length >= 2) {
                // Link to 2 destinations
                await PackageDestination.create({
                    package_id: pkg.id,
                    destination_id: availableDestinations[0].id,
                    nights: 2,
                    order: 1,
                    activities: { 1: [{ name: 'Arrival & Sightseeing' }], 2: [{ name: 'Local Experience' }] }
                });
                await PackageDestination.create({
                    package_id: pkg.id,
                    destination_id: availableDestinations[1].id,
                    nights: 3,
                    order: 2,
                    activities: { 1: [{ name: 'Nature Walk' }], 2: [{ name: 'Shopping' }] }
                });
            }
        }




        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedVendor();
