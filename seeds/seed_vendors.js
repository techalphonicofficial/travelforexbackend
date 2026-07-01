/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Vendor + Wallet Full Seeder
 *  Creates: 5 realistic vendors → wallets → wallet transactions → packages
 * ─────────────────────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  User, Package, Wallet, WalletTransaction,
  Destination, PackageDestination,
  PackageInclusion, PackageExclusion
} = require('../src/container').models;

const seed = async () => {
  try {
    console.log('\n🏪 Starting Vendor + Wallet Seed...\n');

    // ── Fetch existing destinations to link packages ──────────────────────────
    const destinations = await Destination.findAll({ limit: 20 });
    if (destinations.length === 0) {
      console.error('❌ No destinations found. Run initial_data.js seed first!');
      process.exit(1);
    }
    const dest = (i) => destinations[i % destinations.length];

    // ── Vendor definitions ────────────────────────────────────────────────────
    const vendorDefs = [
      {
        name: 'Bali Tours Pvt Ltd',
        email: 'vendor.bali@picktrails.com',
        phone: '+91-9810001001',
        password: 'vendor@1234',
        packages: [
          {
            name: 'Bali Bliss — 5N6D Honeymoon',
            duration_days: 6, price: 58000,
            description: 'Romantic escape to Bali with private villa, sunset dinner, and spa.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['5 nights private pool villa', 'Daily breakfast & dinner', 'Airport transfers', 'Sunset dinner cruise', 'Couple spa session'],
            exclusions: ['International flights', 'Visa fees', 'Personal expenses'],
            destIndices: [0, 1]
          },
          {
            name: 'Bali Adventure Rush — 4N5D',
            duration_days: 5, price: 38000,
            description: 'ATV rides, white water rafting, jungle trekking, and surf lessons.',
            show_in_home_page: true, is_customizable: false,
            inclusions: ['4 nights hotel', 'Daily breakfast', 'ATV ride', 'White water rafting', 'Surf lesson'],
            exclusions: ['Flights', 'Travel insurance', 'Meals not mentioned'],
            destIndices: [0]
          }
        ],
        transactions: [
          { amount: 200000, type: 'credit', desc: 'Initial wallet funding by admin', ref: 'BALI-INIT-001' },
          { amount: 58000,  type: 'debit',  desc: 'Package payout — Bali Bliss (BK-001)', ref: 'BALI-PAY-001' },
          { amount: 38000,  type: 'debit',  desc: 'Package payout — Adventure Rush (BK-002)', ref: 'BALI-PAY-002' },
          { amount: 100000, type: 'credit', desc: 'Wallet top-up — Admin credit', ref: 'BALI-TOP-001' },
          { amount: 15000,  type: 'debit',  desc: 'Commission deducted 15% on BK-001', ref: 'BALI-COM-001' },
        ],
        finalBalance: 229000
      },
      {
        name: 'Maldives Escape Resort',
        email: 'vendor.maldives@picktrails.com',
        phone: '+91-9810002002',
        password: 'vendor@1234',
        packages: [
          {
            name: 'Maldives Overwater Bungalow — 5N6D',
            duration_days: 6, price: 135000,
            description: 'Luxury overwater bungalow experience with house reef snorkeling.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['5N overwater bungalow', 'Full board meals', 'Speedboat transfers', 'Snorkeling gear', 'Sunset dolphin cruise'],
            exclusions: ['International flights', 'Alcohol', 'Water sports add-ons'],
            destIndices: [1, 2]
          },
          {
            name: 'Maldives Budget Bliss — 3N4D',
            duration_days: 4, price: 72000,
            description: 'Affordable Maldives package on a beautiful local island.',
            show_in_home_page: true, is_customizable: false,
            inclusions: ['3N beach villa', 'Daily breakfast', 'Airport speedboat', 'Snorkeling trip'],
            exclusions: ['Flights', 'Dinner', 'Watersports'],
            destIndices: [1]
          }
        ],
        transactions: [
          { amount: 500000, type: 'credit', desc: 'Wallet funded — Maldives Escape onboarding', ref: 'MLD-INIT-001' },
          { amount: 135000, type: 'debit',  desc: 'Payout — Overwater Bungalow pkg (BK-003)', ref: 'MLD-PAY-001' },
          { amount: 72000,  type: 'debit',  desc: 'Payout — Budget Bliss pkg (BK-004)', ref: 'MLD-PAY-002' },
          { amount: 20250,  type: 'debit',  desc: 'Commission 15% on BK-003', ref: 'MLD-COM-001' },
          { amount: 200000, type: 'credit', desc: 'Admin top-up Q1 2025', ref: 'MLD-TOP-001' },
          { amount: 10800,  type: 'debit',  desc: 'Commission 15% on BK-004', ref: 'MLD-COM-002' },
        ],
        finalBalance: 461950
      },
      {
        name: 'Dubai Luxury Travel Co',
        email: 'vendor.dubai@picktrails.com',
        phone: '+91-9810003003',
        password: 'vendor@1234',
        packages: [
          {
            name: 'Dubai Extravaganza — 4N5D',
            duration_days: 5, price: 75000,
            description: 'Desert safari, Burj Khalifa, Palm Jumeirah luxury stay.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['4N 5-star hotel', 'Daily breakfast', 'Desert safari with BBQ dinner', 'Burj Khalifa tickets', 'Dubai city tour'],
            exclusions: ['Flights', 'Visa', 'Personal shopping'],
            destIndices: [2, 3]
          },
          {
            name: 'Dubai Family Fun — 3N4D',
            duration_days: 4, price: 52000,
            description: 'Dubai for families — Global Village, IMG World, Aquaventure.',
            show_in_home_page: false, is_customizable: true,
            inclusions: ['3N hotel', 'Daily breakfast', 'Global Village entry', 'IMG World tickets'],
            exclusions: ['Flights', 'Visa', 'Meals outside hotel'],
            destIndices: [2]
          }
        ],
        transactions: [
          { amount: 300000, type: 'credit', desc: 'Onboarding wallet — Dubai Luxury Travel', ref: 'DXB-INIT-001' },
          { amount: 75000,  type: 'debit',  desc: 'Payout — Dubai Extravaganza (BK-005)', ref: 'DXB-PAY-001' },
          { amount: 11250,  type: 'debit',  desc: 'Commission 15% BK-005', ref: 'DXB-COM-001' },
          { amount: 52000,  type: 'debit',  desc: 'Payout — Family Fun (BK-006)', ref: 'DXB-PAY-002' },
          { amount: 7800,   type: 'debit',  desc: 'Commission 15% BK-006', ref: 'DXB-COM-002' },
          { amount: 150000, type: 'credit', desc: 'Top-up — Feb 2025', ref: 'DXB-TOP-001' },
        ],
        finalBalance: 303950
      },
      {
        name: 'Europe Trails Pvt Ltd',
        email: 'vendor.europe@picktrails.com',
        phone: '+91-9810004004',
        password: 'vendor@1234',
        packages: [
          {
            name: 'Paris Honeymoon Special — 6N7D',
            duration_days: 7, price: 120000,
            description: 'Eiffel Tower, Seine cruise, wine tasting & romantic Parisian hotels.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['6N 4-star hotel near Eiffel Tower', 'Breakfast daily', 'Eiffel Tower access', 'Seine cruise', 'Versailles day trip'],
            exclusions: ['Flights', 'Schengen Visa', 'Travel insurance', 'Dinner'],
            destIndices: [3, 4]
          },
          {
            name: 'Switzerland Alps Adventure — 7N8D',
            duration_days: 8, price: 165000,
            description: 'Jungfraujoch, Interlaken paragliding, Swiss Pass train journeys.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['7N Swiss hotels', 'Swiss travel pass', 'Jungfraujoch tickets', 'Paragliding session', 'Chocolate factory tour'],
            exclusions: ['Flights', 'Schengen Visa', 'Travel insurance'],
            destIndices: [4]
          }
        ],
        transactions: [
          { amount: 800000, type: 'credit', desc: 'Europe Trails onboarding wallet', ref: 'EUR-INIT-001' },
          { amount: 120000, type: 'debit',  desc: 'Payout — Paris Honeymoon (BK-007)', ref: 'EUR-PAY-001' },
          { amount: 18000,  type: 'debit',  desc: 'Commission 15% BK-007', ref: 'EUR-COM-001' },
          { amount: 165000, type: 'debit',  desc: 'Payout — Swiss Alps (BK-008)', ref: 'EUR-PAY-002' },
          { amount: 24750,  type: 'debit',  desc: 'Commission 15% BK-008', ref: 'EUR-COM-002' },
          { amount: 400000, type: 'credit', desc: 'Top-up — Mar 2025', ref: 'EUR-TOP-001' },
          { amount: 120000, type: 'debit',  desc: 'Payout — Paris Honeymoon repeat (BK-010)', ref: 'EUR-PAY-003' },
          { amount: 18000,  type: 'debit',  desc: 'Commission 15% BK-010', ref: 'EUR-COM-003' },
        ],
        finalBalance: 734250
      },
      {
        name: 'Southeast Asia Tours',
        email: 'vendor.sea@picktrails.com',
        phone: '+91-9810005005',
        password: 'vendor@1234',
        packages: [
          {
            name: 'Bangkok Explorer — 5N6D',
            duration_days: 6, price: 32000,
            description: 'Grand Palace, Floating Markets, Tuk-Tuk tours, Rooftop bars.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['5N hotel', 'Daily breakfast', 'Grand Palace tour', 'Floating market trip', 'Muay Thai show'],
            exclusions: ['Flights', 'Visa on arrival fee', 'Dinner', 'Shopping'],
            destIndices: [0, 2]
          },
          {
            name: 'Thailand Beach Combo — 7N8D',
            duration_days: 8, price: 55000,
            description: 'Bangkok + Phuket combo — city, culture, and crystal-clear beaches.',
            show_in_home_page: true, is_customizable: true,
            inclusions: ['7N hotels', 'Daily breakfast', 'Bangkok city tour', 'Phi Phi Islands speedboat', 'Phuket sightseeing'],
            exclusions: ['Flights', 'Travel insurance', 'Meals not mentioned'],
            destIndices: [0, 1]
          }
        ],
        transactions: [
          { amount: 250000, type: 'credit', desc: 'SE Asia Tours onboarding', ref: 'SEA-INIT-001' },
          { amount: 32000,  type: 'debit',  desc: 'Payout — Bangkok Explorer (BK-009)', ref: 'SEA-PAY-001' },
          { amount: 4800,   type: 'debit',  desc: 'Commission 15% BK-009', ref: 'SEA-COM-001' },
          { amount: 55000,  type: 'debit',  desc: 'Payout — Thailand Beach Combo (BK-011)', ref: 'SEA-PAY-002' },
          { amount: 8250,   type: 'debit',  desc: 'Commission 15% BK-011', ref: 'SEA-COM-002' },
          { amount: 100000, type: 'credit', desc: 'Top-up — Mar 2025', ref: 'SEA-TOP-001' },
        ],
        finalBalance: 249950
      }
    ];

    // ── Seed each vendor ──────────────────────────────────────────────────────
    const results = [];

    for (const v of vendorDefs) {
      console.log(`\n📦 Seeding vendor: ${v.name}`);

      // 1. Create vendor user
      const hashedPwd = await bcrypt.hash(v.password, 10);
      const [vendor, userCreated] = await User.findOrCreate({
        where: { email: v.email },
        defaults: {
          name: v.name,
          email: v.email,
          phone_number: v.phone,
          password: hashedPwd,
          type: 'vendor',
          status: true
        }
      });
      console.log(`   ${userCreated ? '✅' : '⚠️ exists'} User: ${v.email}`);

      // 2. Create wallet (set balance to final expected balance)
      const [wallet, walletCreated] = await Wallet.findOrCreate({
        where: { user_id: vendor.id },
        defaults: { balance: v.finalBalance, currency: 'INR' }
      });
      if (!walletCreated) {
        await wallet.update({ balance: v.finalBalance });
      }
      console.log(`   ✅ Wallet: ₹${v.finalBalance.toLocaleString('en-IN')}`);

      // 3. Create wallet transactions
      let txCount = 0;
      for (const tx of v.transactions) {
        const [, txCreated] = await WalletTransaction.findOrCreate({
          where: { reference_id: tx.ref },
          defaults: {
            wallet_id: wallet.id,
            amount: tx.amount,
            type: tx.type,
            description: tx.desc,
            status: 'completed',
            reference_id: tx.ref
          }
        });
        if (txCreated) txCount++;
      }
      console.log(`   ✅ Wallet transactions: ${txCount} created (${v.transactions.length} total)`);

      // 4. Create packages
      let pkgCount = 0;
      for (const p of v.packages) {
        const [pkg, pkgCreated] = await Package.findOrCreate({
          where: { name: p.name },
          defaults: {
            name: p.name,
            duration_days: p.duration_days,
            price: p.price,
            description: p.description,
            vendor_id: vendor.id,
            show_in_home_page: p.show_in_home_page,
            is_customizable: p.is_customizable,
            status: true
          }
        });

        if (pkgCreated) {
          pkgCount++;

          // Link destinations
          for (let i = 0; i < p.destIndices.length; i++) {
            const d = dest(p.destIndices[i]);
            if (d) {
              await PackageDestination.findOrCreate({
                where: { package_id: pkg.id, destination_id: d.id },
                defaults: {
                  package_id: pkg.id,
                  destination_id: d.id,
                  nights: Math.floor(p.duration_days / p.destIndices.length),
                  order: i + 1,
                  activities: {}
                }
              });
            }
          }

          // Inclusions
          for (const inc of p.inclusions) {
            await PackageInclusion.findOrCreate({
              where: { package_id: pkg.id, text: inc },
              defaults: { package_id: pkg.id, text: inc }
            });
          }

          // Exclusions
          for (const exc of p.exclusions) {
            await PackageExclusion.findOrCreate({
              where: { package_id: pkg.id, text: exc },
              defaults: { package_id: pkg.id, text: exc }
            });
          }
        }
      }
      console.log(`   ✅ Packages: ${pkgCount} created`);

      results.push({ name: v.name, email: v.email, balance: v.finalBalance, packages: v.packages.length, txns: v.transactions.length });
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n🎉 ═══════════════ VENDOR SEED COMPLETE ═══════════════');
    console.log('\n📋 Vendor Summary:\n');
    console.log('  Vendor                      Email                              Balance           Pkgs  Txns');
    console.log('  ' + '─'.repeat(100));
    for (const r of results) {
      console.log(
        `  ${r.name.padEnd(28)} ${r.email.padEnd(35)} ₹${String(r.balance.toLocaleString('en-IN')).padStart(12)}  ${r.packages}     ${r.txns}`
      );
    }

    const totalBalance = results.reduce((s, r) => s + r.balance, 0);
    console.log('  ' + '─'.repeat(100));
    console.log(`  ${'TOTAL'.padEnd(65)} ₹${String(totalBalance.toLocaleString('en-IN')).padStart(12)}  ${results.reduce((s,r)=>s+r.packages,0)}     ${results.reduce((s,r)=>s+r.txns,0)}`);

    console.log('\n🔑 All vendor logins (password: vendor@1234):');
    for (const r of results) {
      console.log(`   📧 ${r.email}`);
    }
    console.log('\n   Vendor portal: http://localhost:3000/vendor/login\n');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Vendor seed FAILED:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
