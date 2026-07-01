/**
 * ─────────────────────────────────────────────────────────────
 *  Ledger & Debit/Credit Seeder
 *  Seeds:  accounts (chart of accounts)  →  journal_entries  →  journal_entry_lines
 * ─────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const sequelize = require('../src/database');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  try {
    console.log('\n📒 Starting Ledger & Debit/Credit Seed...\n');

    const now = new Date();

    // ─────────────────────────────────────────────────────────
    // STEP 1 – Clear existing ledger data (safe order)
    // ─────────────────────────────────────────────────────────
    console.log('🗑️  Clearing old ledger data...');
    await sequelize.query(`DELETE FROM journal_entry_lines`);
    await sequelize.query(`DELETE FROM journal_entries`);
    await sequelize.query(`DELETE FROM accounts`);
    console.log('✅ Cleared.\n');

    // ─────────────────────────────────────────────────────────
    // STEP 2 – Chart of Accounts
    // ─────────────────────────────────────────────────────────
    console.log('📂 Seeding Chart of Accounts...');

    const accountData = [
      // ── Assets ──
      { id: uuidv4(), code: '1000', name: 'Cash and Bank',          type: 'asset',     description: 'Main operating bank account (HDFC Current A/C)',  is_active: true },
      { id: uuidv4(), code: '1010', name: 'Petty Cash',             type: 'asset',     description: 'Office petty cash box',                            is_active: true },
      { id: uuidv4(), code: '1100', name: 'Accounts Receivable',    type: 'asset',     description: 'Money owed by customers for confirmed bookings',    is_active: true },
      { id: uuidv4(), code: '1200', name: 'Prepaid Expenses',       type: 'asset',     description: 'Advance payments to vendors / hotels',             is_active: true },
      { id: uuidv4(), code: '1300', name: 'Forex Receivable',       type: 'asset',     description: 'Pending forex conversion settlements',             is_active: true },

      // ── Liabilities ──
      { id: uuidv4(), code: '2000', name: 'Vendor Payables (Wallets)', type: 'liability', description: 'Funds held in vendor wallets awaiting payout',  is_active: true },
      { id: uuidv4(), code: '2100', name: 'GST Payable',            type: 'liability', description: '18% GST collected on services',                   is_active: true },
      { id: uuidv4(), code: '2200', name: 'TDS Payable',            type: 'liability', description: 'TDS deducted from vendor payments',                is_active: true },
      { id: uuidv4(), code: '2300', name: 'Customer Advance',       type: 'liability', description: 'Advances received before trip confirmation',        is_active: true },

      // ── Equity ──
      { id: uuidv4(), code: '3000', name: "Owner's Capital",        type: 'equity',    description: 'Promoter capital injected into the business',      is_active: true },
      { id: uuidv4(), code: '3100', name: 'Retained Earnings',      type: 'equity',    description: 'Accumulated profits retained in the business',     is_active: true },

      // ── Revenue ──
      { id: uuidv4(), code: '4000', name: 'Sales Revenue',          type: 'revenue',   description: 'Commission / markup on travel packages',           is_active: true },
      { id: uuidv4(), code: '4100', name: 'Forex Revenue',          type: 'revenue',   description: 'Spread earned on currency exchange',               is_active: true },
      { id: uuidv4(), code: '4200', name: 'Service Fees',           type: 'revenue',   description: 'Visa, insurance and other service charges',        is_active: true },
      { id: uuidv4(), code: '4300', name: 'Cancellation Income',    type: 'revenue',   description: 'Cancellation charges retained from refunds',       is_active: true },

      // ── Expenses ──
      { id: uuidv4(), code: '5000', name: 'Cost of Goods Sold',     type: 'expense',   description: 'Direct vendor / hotel / flight payments',          is_active: true },
      { id: uuidv4(), code: '5100', name: 'Marketing & Advertising',type: 'expense',   description: 'Google Ads, Meta, influencer campaigns',           is_active: true },
      { id: uuidv4(), code: '5200', name: 'Software Subscriptions', type: 'expense',   description: 'CRM, SaaS, cloud servers',                         is_active: true },
      { id: uuidv4(), code: '5300', name: 'Bank & Payment Fees',    type: 'expense',   description: 'Razorpay / Paytm payment gateway charges',         is_active: true },
      { id: uuidv4(), code: '5400', name: 'Salaries & Wages',       type: 'expense',   description: 'Employee salaries and contractor payments',        is_active: true },
      { id: uuidv4(), code: '5500', name: 'Rent & Utilities',       type: 'expense',   description: 'Office rent, electricity, internet',               is_active: true },
      { id: uuidv4(), code: '5600', name: 'Forex Losses',           type: 'expense',   description: 'Losses from adverse currency movements',           is_active: true },
    ];

    // Stamp timestamps
    const accounts = accountData.map(a => ({ ...a, created_at: now, updated_at: now }));
    await sequelize.query(
      `INSERT INTO accounts (id, code, name, type, description, is_active, created_at, updated_at)
       VALUES ${accounts.map(() => '(?,?,?,?,?,?,?,?)').join(',')}`,
      {
        replacements: accounts.flatMap(a => [
          a.id, a.code, a.name, a.type, a.description, a.is_active, a.created_at, a.updated_at
        ])
      }
    );

    // Helper: find account id by code
    const acc = (code) => accounts.find(a => a.code === code).id;

    console.log(`✅ ${accounts.length} accounts seeded.\n`);

    // ─────────────────────────────────────────────────────────
    // STEP 3 – Journal Entries + Lines
    // ─────────────────────────────────────────────────────────
    console.log('📒 Seeding Journal Entries & Debit/Credit Lines...\n');

    // Helper to insert a complete journal entry with its lines.
    // Lines: [{ account_code, debit, credit, memo }]
    // Rule: sum(debits) must equal sum(credits) for each entry.
    const insertEntry = async (entry, lines) => {
      const entryId = uuidv4();
      const entryDate = entry.date || now;

      await sequelize.query(
        `INSERT INTO journal_entries (id, entry_date, description, reference_type, reference_id, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?)`,
        { replacements: [entryId, entryDate, entry.description, entry.ref_type || null, entry.ref_id || null, now, now] }
      );

      for (const line of lines) {
        await sequelize.query(
          `INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, memo, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?)`,
          { replacements: [uuidv4(), entryId, acc(line.code), line.debit || 0, line.credit || 0, line.memo || null, now, now] }
        );
      }

      const totalDebit  = lines.reduce((s, l) => s + (l.debit  || 0), 0);
      const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
      console.log(`  ✅ [${entry.label}]  Dr ₹${totalDebit.toLocaleString()}  |  Cr ₹${totalCredit.toLocaleString()}`);
    };

    // ── 1. Capital Injection ────────────────────────────────
    await insertEntry(
      { label: 'Capital Injection', description: "Owner's initial capital investment", ref_type: 'OwnerCapital', date: new Date('2025-01-01') },
      [
        { code: '1000', debit: 500000, memo: 'Cash deposited into HDFC current account' },
        { code: '3000', credit: 500000, memo: "Owner's capital contribution" },
      ]
    );

    // ── 2. Package Booking – Bali (Customer Payment) ────────
    await insertEntry(
      { label: 'Bali Package Booking', description: 'Package booking - Bali Bliss 5N6D (Customer: Priya Sharma)', ref_type: 'PackageBooking', ref_id: 'BK-001', date: new Date('2025-01-10') },
      [
        { code: '1000', debit: 45000, memo: 'Full payment received via Razorpay' },
        { code: '4000', credit: 38000, memo: 'Package revenue – Bali Bliss' },
        { code: '2100', credit: 7000,  memo: 'GST 18% on ₹38,889 (rounded)' },
      ]
    );

    // ── 3. Vendor Payment – Hotel ───────────────────────────
    await insertEntry(
      { label: 'Hotel Vendor Payment', description: 'Payment to Bali Nusa Resort – Bali Bliss package', ref_type: 'VendorPayment', ref_id: 'VP-001', date: new Date('2025-01-11') },
      [
        { code: '5000', debit: 28000, memo: 'Hotel cost for 5 nights – Bali Nusa Resort' },
        { code: '2200', debit: 2800,  memo: 'TDS @ 10% deducted from vendor payment' },
        { code: '1000', credit: 30800, memo: 'Net bank transfer to vendor' },
      ]
    );

    // ── 4. Customer Advance – Dubai Package ─────────────────
    await insertEntry(
      { label: 'Dubai Advance Received', description: 'Advance booking deposit – Dubai Luxury (Rahul Mehta)', ref_type: 'CustomerAdvance', ref_id: 'ADV-001', date: new Date('2025-01-15') },
      [
        { code: '1000', debit: 20000, memo: 'Advance deposit received via NEFT' },
        { code: '2300', credit: 20000, memo: 'Customer advance liability – Dubai package' },
      ]
    );

    // ── 5. Advance Settled on Dubai Booking ─────────────────
    await insertEntry(
      { label: 'Dubai Booking Settled', description: 'Full Dubai booking settled – advance adjusted (Rahul Mehta)', ref_type: 'PackageBooking', ref_id: 'BK-002', date: new Date('2025-01-20') },
      [
        { code: '2300', debit: 20000, memo: 'Advance adjusted from liability' },
        { code: '1000', debit: 55000, memo: 'Balance payment received' },
        { code: '4000', credit: 63559, memo: 'Package revenue – Dubai Luxury' },
        { code: '2100', credit: 11441, memo: 'GST 18% collected' },
      ]
    );

    // ── 6. Forex Transaction – USD to INR ───────────────────
    await insertEntry(
      { label: 'Forex USD→INR', description: 'Currency exchange – $1,000 USD to INR at 84.20 (Customer: Ananya Singh)', ref_type: 'ForexTransaction', ref_id: 'FX-001', date: new Date('2025-01-22') },
      [
        { code: '1000', debit: 84200, memo: 'INR received from forex customer' },
        { code: '1300', credit: 83000, memo: 'USD purchase cost at interbank rate 83.00' },
        { code: '4100', credit: 1200,  memo: 'Forex spread revenue ($1000 × ₹1.20)' },
      ]
    );

    // ── 7. Marketing Expense – Google Ads ───────────────────
    await insertEntry(
      { label: 'Google Ads – Jan', description: 'Google Ads spend – January 2025 campaign', ref_type: 'Expense', date: new Date('2025-01-25') },
      [
        { code: '5100', debit: 15000, memo: 'Google Ads monthly budget' },
        { code: '1000', credit: 15000, memo: 'Deducted from bank account' },
      ]
    );

    // ── 8. Employee Salary – January ────────────────────────
    await insertEntry(
      { label: 'January Salaries', description: 'Salary disbursement – January 2025 (3 employees)', ref_type: 'Payroll', date: new Date('2025-01-31') },
      [
        { code: '5400', debit: 90000, memo: 'Gross salaries: Admin ₹40k, Sales ₹30k, Support ₹20k' },
        { code: '1000', credit: 90000, memo: 'Net bank transfer for salaries' },
      ]
    );

    // ── 9. Software Subscription ────────────────────────────
    await insertEntry(
      { label: 'SaaS Subscriptions', description: 'Monthly SaaS subscriptions – Zoho + AWS + Razorpay', ref_type: 'Expense', date: new Date('2025-02-01') },
      [
        { code: '5200', debit: 8500, memo: 'Zoho CRM ₹3k + AWS ₹3.5k + Razorpay monthly ₹2k' },
        { code: '1000', credit: 8500, memo: 'Auto-debit from bank' },
      ]
    );

    // ── 10. Paris Honeymoon Package Booking ─────────────────
    await insertEntry(
      { label: 'Paris Honeymoon Booking', description: 'Package booking – Paris Honeymoon 7N (Customer: Kabir & Priya)', ref_type: 'PackageBooking', ref_id: 'BK-003', date: new Date('2025-02-05') },
      [
        { code: '1100', debit: 95000, memo: 'Invoice raised – partial payment pending' },
        { code: '4000', credit: 80508, memo: 'Package revenue – Paris Honeymoon Special' },
        { code: '2100', credit: 14492, memo: 'GST 18% on service value' },
      ]
    );

    // ── 11. Accounts Receivable Collection – Paris ──────────
    await insertEntry(
      { label: 'Paris Payment Collected', description: 'Full payment collected – Paris Honeymoon (Kabir & Priya)', ref_type: 'PaymentReceipt', ref_id: 'PR-001', date: new Date('2025-02-08') },
      [
        { code: '1000', debit: 95000, memo: 'Payment received via RTGS' },
        { code: '1100', credit: 95000, memo: 'Accounts receivable cleared' },
      ]
    );

    // ── 12. Vendor Wallet Top-up ─────────────────────────────
    await insertEntry(
      { label: 'Vendor Wallet Top-up', description: 'Wallet credit for vendor – Bali Tours Pvt Ltd', ref_type: 'WalletTransaction', ref_id: 'WT-001', date: new Date('2025-02-10') },
      [
        { code: '2000', debit: 50000, memo: 'Vendor wallet funded for upcoming payouts' },
        { code: '1000', credit: 50000, memo: 'Bank transfer to escrow' },
      ]
    );

    // ── 13. Forex Transaction – EUR to INR ──────────────────
    await insertEntry(
      { label: 'Forex EUR→INR', description: 'Currency exchange – €500 EUR to INR at 90.50 (Customer: Sunita Rao)', ref_type: 'ForexTransaction', ref_id: 'FX-002', date: new Date('2025-02-12') },
      [
        { code: '1000', debit: 45250, memo: 'INR collected from customer for €500' },
        { code: '1300', credit: 44500, memo: 'EUR purchase cost at interbank 89.00' },
        { code: '4100', credit: 750,   memo: 'Forex spread revenue (€500 × ₹1.50)' },
      ]
    );

    // ── 14. Office Rent – February ───────────────────────────
    await insertEntry(
      { label: 'Office Rent – Feb', description: 'Monthly office rent payment – February 2025', ref_type: 'Expense', date: new Date('2025-02-15') },
      [
        { code: '5500', debit: 25000, memo: 'Commercial office rent – Sector 18, Noida' },
        { code: '1000', credit: 25000, memo: 'Cheque payment to landlord' },
      ]
    );

    // ── 15. Package Cancellation Refund ─────────────────────
    await insertEntry(
      { label: 'Cancellation & Refund', description: 'Bangkok package cancelled – partial refund issued (Customer: Deepak Nair)', ref_type: 'Cancellation', ref_id: 'CN-001', date: new Date('2025-02-18') },
      [
        { code: '4000', debit: 20000,  memo: 'Revenue reversed for cancelled portion' },
        { code: '2100', debit: 3600,   memo: 'GST reversed on cancelled booking' },
        { code: '4300', credit: 5000,  memo: 'Cancellation charges retained (25%)' },
        { code: '1000', credit: 18600, memo: 'Net refund transferred to customer' },
      ]
    );

    // ── 16. GST Filing – January ─────────────────────────────
    await insertEntry(
      { label: 'GST Payment – Jan', description: 'GST paid to government – GSTR-3B January 2025', ref_type: 'TaxPayment', date: new Date('2025-02-20') },
      [
        { code: '2100', debit: 18000, memo: 'GST liability settled for January' },
        { code: '1000', credit: 18000, memo: 'Online payment via GST portal' },
      ]
    );

    // ── 17. Bank Payment Fees ────────────────────────────────
    await insertEntry(
      { label: 'Payment Gateway Fees', description: 'Razorpay fees for Jan–Feb transactions (2.5% avg)', ref_type: 'Expense', date: new Date('2025-02-28') },
      [
        { code: '5300', debit: 3800, memo: 'Gateway charges auto-deducted by Razorpay' },
        { code: '1000', credit: 3800, memo: 'Net settlement after fee deduction' },
      ]
    );

    // ── 18. Petty Cash Replenishment ─────────────────────────
    await insertEntry(
      { label: 'Petty Cash Refill', description: 'Petty cash box replenished – office sundries', ref_type: 'PettyCash', date: new Date('2025-03-01') },
      [
        { code: '1010', debit: 5000, memo: 'Cash withdrawn for petty cash' },
        { code: '1000', credit: 5000, memo: 'Bank withdrawal' },
      ]
    );

    // ── 19. Maldives Package – Full Booking ─────────────────
    await insertEntry(
      { label: 'Maldives Booking', description: 'Maldives Escape 5N package booked (Customer: Meera Joshi)', ref_type: 'PackageBooking', ref_id: 'BK-004', date: new Date('2025-03-05') },
      [
        { code: '1000', debit: 120000, memo: 'Full payment received – UPI transfer' },
        { code: '4000', credit: 101695, memo: 'Package revenue – Maldives Escape' },
        { code: '2100', credit: 18305, memo: 'GST 18% on service' },
      ]
    );

    // ── 20. Maldives Vendor Payment ──────────────────────────
    await insertEntry(
      { label: 'Maldives Vendor Payment', description: 'Vendor payment – Sun Island Resort Maldives', ref_type: 'VendorPayment', ref_id: 'VP-002', date: new Date('2025-03-06') },
      [
        { code: '5000', debit: 78000, memo: 'Resort + transfers cost for Maldives Escape' },
        { code: '2200', debit: 7800,  memo: 'TDS @ 10% deducted' },
        { code: '1000', credit: 85800, memo: 'Net wire transfer to Maldives vendor' },
      ]
    );

    // ─────────────────────────────────────────────────────────
    // STEP 4 – Summary
    // ─────────────────────────────────────────────────────────
    const [entriesCount] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM journal_entries`);
    const [linesCount]   = await sequelize.query(`SELECT COUNT(*) AS cnt FROM journal_entry_lines`);
    const [totalDr]      = await sequelize.query(`SELECT COALESCE(SUM(debit),0) AS total FROM journal_entry_lines`);
    const [totalCr]      = await sequelize.query(`SELECT COALESCE(SUM(credit),0) AS total FROM journal_entry_lines`);

    console.log('\n🎉 ══════════════ LEDGER SEED COMPLETE ══════════════');
    console.log(`   Accounts:        ${accounts.length}`);
    console.log(`   Journal Entries: ${entriesCount[0].cnt}`);
    console.log(`   Ledger Lines:    ${linesCount[0].cnt}`);
    console.log(`   Total Debits:    ₹${Number(totalDr[0].total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log(`   Total Credits:   ₹${Number(totalCr[0].total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log('═════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Ledger seed FAILED:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
