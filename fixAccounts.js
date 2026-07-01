const { db } = require('./src/container');

async function fixAccounts() {
    try {
        const { Account, JournalEntry, JournalEntryLine } = db.models;
        
        let customerAcc = await Account.findOne({ where: { code: '2100' }});
        if (!customerAcc) {
            customerAcc = await Account.create({
                code: '2100',
                name: 'Customer Wallet Payables',
                type: 'liability',
                description: 'Funds owed to customers in their Pickyourtrail wallet'
            });
            console.log('Created Customer Wallet Payables account (2100)');
        }

        const refunds = await JournalEntry.findAll({ where: { reference_type: 'BookingRefund' }});
        let updatedCount = 0;
        for (let r of refunds) {
            const [updated] = await JournalEntryLine.update(
                { account_id: customerAcc.id }, 
                { where: { journal_entry_id: r.id, memo: 'Customer wallet credited' } }
            );
            updatedCount += updated;
        }
        console.log(`Updated ${updatedCount} existing journal lines to point to 2100.`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

fixAccounts();
