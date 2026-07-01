class AccountingService {
    constructor(accountingRepo) {
        this.repo = accountingRepo;
    }

    async getChartOfAccounts() {
        return await this.repo.getAllAccounts();
    }

    async getLedger(page = 1, limit = 50, filters = {}) {
        const offset = (page - 1) * limit;
        return await this.repo.getLedger(limit, offset, filters);
    }

    async getDashboardStats() {
        return await this.repo.getDashboardStats();
    }

    async getTrialBalance() {
        const rows = await this.repo.getTrialBalance();
        const totalDebit  = rows.reduce((s, r) => s + parseFloat(r.total_debit),  0);
        const totalCredit = rows.reduce((s, r) => s + parseFloat(r.total_credit), 0);
        return { rows, totalDebit, totalCredit };
    }

    async getPnL(dateFrom = null, dateTo = null) {
        const rows = await this.repo.getPnL(dateFrom, dateTo);

        const revenue  = rows.filter(r => r.type === 'revenue');
        const expenses = rows.filter(r => r.type === 'expense');

        const totalRevenue  = revenue.reduce((s, r)  => s + (parseFloat(r.total_credit) - parseFloat(r.total_debit)), 0);
        const totalExpenses = expenses.reduce((s, r) => s + (parseFloat(r.total_debit) - parseFloat(r.total_credit)), 0);
        const netProfit     = totalRevenue - totalExpenses;

        return { revenue, expenses, totalRevenue, totalExpenses, netProfit };
    }

    async getAccounts() {
        const accounts = await this.repo.getAllAccounts();
        // Group by type
        const grouped = { asset: [], liability: [], equity: [], revenue: [], expense: [] };
        accounts.forEach(a => {
            if (grouped[a.type]) grouped[a.type].push(a);
        });
        return grouped;
    }

    async getRecentEntries(limit = 5) {
        return await this.repo.getRecentEntries(limit);
    }

    async getMonthlyRevenue() {
        return await this.repo.getMonthlyRevenue();
    }

    getVoucherTypes() {
        return [
            { value: 'receipt', label: 'Receipt Voucher' },
            { value: 'payment', label: 'Payment Voucher' },
            { value: 'journal', label: 'Journal Voucher' },
            { value: 'contra', label: 'Contra Voucher' },
            { value: 'booking', label: 'Booking Voucher' },
            { value: 'sales', label: 'Sales Voucher' },
            { value: 'credit_note', label: 'Credit Note' },
            { value: 'debit_note', label: 'Debit Note' },
            { value: 'refund', label: 'Refund Voucher' }
        ];
    }

    async getVouchers(page = 1, limit = 50, filters = {}) {
        const offset = (page - 1) * limit;
        return await this.repo.getVouchers(limit, offset, filters);
    }

    async getVoucherById(id) {
        return await this.repo.getVoucherById(id);
    }

    roundMoney(value) {
        return Math.round(Number(value || 0) * 100) / 100;
    }

    getLineTotal(lines, key) {
        return this.roundMoney(lines.reduce((sum, line) => sum + Number(line[key] || 0), 0));
    }

    async createVoucherJournalEntry({
        voucher_type = 'journal',
        voucher_date = null,
        description,
        entry_date = null,
        reference_type = null,
        reference_id = null,
        party_type = null,
        party_id = null,
        total_amount = null,
        lines,
        created_by = null,
        metadata = {},
        status = 'posted'
    }, transaction = null) {
        const totalDebit = this.getLineTotal(lines, 'debit');
        const totalCredit = this.getLineTotal(lines, 'credit');

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
        }
        if (lines.length < 2) {
            throw new Error('A journal entry must have at least 2 lines.');
        }

        const voucherDate = voucher_date || entry_date || new Date();
        const entryDate = entry_date || voucherDate;
        const amount = total_amount !== null && total_amount !== undefined ? this.roundMoney(total_amount) : totalDebit;

        return await this.repo.createVoucherWithJournalEntry(
            {
                voucher_type,
                voucher_date: voucherDate,
                status,
                reference_type,
                reference_id,
                party_type,
                party_id,
                total_amount: amount,
                narration: description,
                metadata: metadata || {},
                created_by,
                posted_by: status === 'posted' ? created_by : null
            },
            {
                description,
                entry_date: entryDate ? new Date(entryDate) : new Date(),
                reference_type: reference_type || 'ManualEntry',
                reference_id: reference_id || null,
                created_by: created_by || null
            },
            lines,
            transaction
        );
    }

    // ── Manual Journal Entry ──────────────────────────────────────────────────
    async createManualJournalEntry({ voucher_type = 'journal', description, entry_date, reference_type, reference_id, lines, created_by }) {
        return await this.createVoucherJournalEntry({
            voucher_type,
            description,
            entry_date,
            reference_type: reference_type || 'ManualEntry',
            reference_id: reference_id || null,
            lines,
            created_by: created_by || null
        });
    }

    // ── Existing automated recording methods ─────────────────────────────────
    async recordWalletTopup(amount, referenceId = null, userId = null, transaction = null) {
        const cashAcc    = await this.repo.getAccountByCode('1000');
        const payableAcc = await this.repo.getAccountByCode('2000');
        if (!cashAcc || !payableAcc) throw new Error('Missing required accounts for Wallet Topup.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'receipt',
                description: 'Vendor Wallet Top-up',
                reference_type: 'WalletTransaction',
                reference_id: referenceId,
                party_type: 'vendor',
                party_id: referenceId,
                created_by: userId,
                lines: [
                    { account_id: cashAcc.id, debit: amount, credit: 0 },
                    { account_id: payableAcc.id, debit: 0, credit: amount }
                ]
            },
            transaction
        );
    }

    async recordVendorPayout(amount, referenceId = null, userId = null, transaction = null) {
        const cashAcc    = await this.repo.getAccountByCode('1000');
        const payableAcc = await this.repo.getAccountByCode('2000');
        if (!cashAcc || !payableAcc) throw new Error('Missing required accounts for Vendor Payout.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'payment',
                description: 'Vendor Wallet Payout',
                reference_type: 'WalletTransaction',
                reference_id: referenceId,
                party_type: 'vendor',
                party_id: referenceId,
                created_by: userId,
                lines: [
                    { account_id: payableAcc.id, debit: amount, credit: 0 },
                    { account_id: cashAcc.id, debit: 0, credit: amount }
                ]
            },
            transaction
        );
    }

    async recordLeadWonBooking(amount, leadId, userId = null, transaction = null) {
        const value = Number(amount || 0);
        if (!value || value <= 0) return null;

        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'LeadWon', reference_id: String(leadId) }, transaction
        });
        if (existing) return existing;

        const receivableAcc = await this.repo.getAccountByCode('1100');
        const salesAcc      = await this.repo.getAccountByCode('4000');
        if (!receivableAcc || !salesAcc) throw new Error('Missing required accounts for lead booking.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'booking',
                description: `Lead #${leadId} converted to booking`,
                reference_type: 'LeadWon',
                reference_id: String(leadId),
                party_type: 'lead',
                party_id: String(leadId),
                created_by: userId,
                lines: [
                    { account_id: receivableAcc.id, debit: value, credit: 0, memo: 'Customer receivable booked' },
                    { account_id: salesAcc.id, debit: 0, credit: value, memo: 'Package sales revenue booked' }
                ]
            },
            transaction
        );
    }

    async recordForexConversionRequest({ requestId, leadId = null, amount = 0, customerName = null, userId = null, transaction = null } = {}) {
        if (!requestId) throw new Error('Forex request id is required for accounting.');
        const value = Number(amount || 0);
        if (!value || value <= 0) return null;

        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'ForexConversionRequest', reference_id: String(requestId) },
            transaction
        });
        if (existing) return existing;

        const receivableAcc = await this.repo.getAccountByCode('1100', transaction);
        const salesAcc = await this.repo.getAccountByCode('4000', transaction);
        if (!receivableAcc || !salesAcc) throw new Error('Missing required accounts for forex conversion request.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'sales',
                description: `Forex request #${requestId} converted${customerName ? ` - ${customerName}` : ''}`,
                reference_type: 'ForexConversionRequest',
                reference_id: String(requestId),
                party_type: leadId ? 'lead' : 'customer',
                party_id: leadId ? String(leadId) : null,
                created_by: userId,
                lines: [
                    { account_id: receivableAcc.id, debit: value, credit: 0, memo: leadId ? `Customer receivable for CRM lead #${leadId}` : 'Customer receivable for forex request' },
                    { account_id: salesAcc.id, debit: 0, credit: value, memo: 'Forex service revenue booked' }
                ]
            },
            transaction
        );
    }

    async recordConfirmedBooking(bookingId, bookingRef, amount, userId = null, transaction = null) {
        const value = Number(amount || 0);
        if (!value || value <= 0) return null;

        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'ConfirmedBooking', reference_id: String(bookingId) }, transaction
        });
        if (existing) return existing;

        const receivableAcc = await this.repo.getAccountByCode('1100');
        const salesAcc      = await this.repo.getAccountByCode('4000');
        if (!receivableAcc || !salesAcc) throw new Error('Missing required accounts for confirmed booking.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'booking',
                description: `Booking ${bookingRef} Confirmed`,
                reference_type: 'ConfirmedBooking',
                reference_id: String(bookingId),
                party_type: 'booking',
                party_id: String(bookingId),
                created_by: userId,
                lines: [
                    { account_id: receivableAcc.id, debit: value, credit: 0, memo: 'Customer receivable booked' },
                    { account_id: salesAcc.id, debit: 0, credit: value, memo: 'Booking sales revenue recognized' }
                ]
            },
            transaction
        );
    }

    async recordConvertedHotelBooking({ bookingId, hotelName = null, baseAmount = 0, commissionAmount = 0, totalAmount = null, userId = null, transaction = null } = {}) {
        if (!bookingId) throw new Error('Hotel booking id is required for accounting.');

        const toMoney = value => Math.round(Number(value || 0) * 100) / 100;
        const base = toMoney(baseAmount);
        let commission = toMoney(commissionAmount);
        let total = toMoney(totalAmount !== null && totalAmount !== undefined ? totalAmount : (base + commission));
        if (!total && base + commission > 0) total = toMoney(base + commission);
        if (!total || total <= 0) return null;

        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'HotelBookingConverted', reference_id: String(bookingId) },
            transaction
        });
        if (existing) return existing;

        const hotelPayable = Math.min(base, total);
        commission = toMoney(total - hotelPayable);

        const receivableAcc = await this.repo.getAccountByCode('1100', transaction);
        const payableAcc = hotelPayable > 0 ? await this.repo.getAccountByCode('2000', transaction) : null;
        const salesAcc = commission > 0 ? await this.repo.getAccountByCode('4000', transaction) : null;

        if (!receivableAcc) throw new Error('Missing Accounts Receivable account for hotel booking.');
        if (hotelPayable > 0 && !payableAcc) throw new Error('Missing Vendor Payables account for hotel booking.');
        if (commission > 0 && !salesAcc) throw new Error('Missing Sales Revenue account for hotel commission.');

        const lines = [{ account_id: receivableAcc.id, debit: total, credit: 0, memo: 'Hotel booking customer receivable booked' }];
        if (hotelPayable > 0) {
            lines.push({ account_id: payableAcc.id, debit: 0, credit: hotelPayable, memo: 'Hotel payable booked' });
        }
        if (commission > 0) {
            lines.push({ account_id: salesAcc.id, debit: 0, credit: commission, memo: 'Hotel commission revenue recognized' });
        }

        if (lines.length < 2) return null;

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'booking',
                description: `Hotel booking ${String(bookingId).slice(0, 8)} converted${hotelName ? ` - ${hotelName}` : ''}`,
                reference_type: 'HotelBookingConverted',
                reference_id: String(bookingId),
                party_type: 'hotel_booking',
                party_id: String(bookingId),
                created_by: userId,
                lines
            },
            transaction
        );
    }

    async recordPackageBookingSplit({ bookingId, bookingRef, packageName = null, paidAmount = 0, remainingAmount = 0, taxAmount = 0, vendorAmount = 0, platformAmount = 0, vendorId = null } = {}, userId = null, transaction = null) {
        if (!bookingId) throw new Error('Package booking id is required for accounting.');

        const toMoney = value => Math.round(Number(value || 0) * 100) / 100;
        const paid = toMoney(paidAmount);
        const receivable = toMoney(remainingAmount);
        const tax = toMoney(taxAmount);
        const vendorPayable = toMoney(vendorAmount);
        let revenue = toMoney(platformAmount);

        if (paid + receivable <= 0) return null;

        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'PackageBooking', reference_id: String(bookingId) },
            transaction
        });
        if (existing) return existing;

        const debitTotal = toMoney(paid + receivable);
        const creditTotal = toMoney(vendorPayable + revenue + tax);
        const difference = toMoney(debitTotal - creditTotal);
        if (Math.abs(difference) > 0 && Math.abs(difference) <= 0.05 && revenue + difference >= 0) {
            revenue = toMoney(revenue + difference);
        }

        if (Math.abs(toMoney(debitTotal - (vendorPayable + revenue + tax))) > 0.01) {
            throw new Error('Package booking split is not balanced.');
        }

        const cashAcc = paid > 0 ? await this.repo.getAccountByCode('1000', transaction) : null;
        const receivableAcc = receivable > 0 ? await this.repo.getAccountByCode('1100', transaction) : null;
        const payableAcc = vendorPayable > 0 ? await this.repo.getAccountByCode('2000', transaction) : null;
        const salesAcc = revenue > 0 ? await this.repo.getAccountByCode('4000', transaction) : null;
        const taxAcc = tax > 0 ? await this.repo.getAccountByCode('2100', transaction) : null;

        if (paid > 0 && !cashAcc) throw new Error('Missing Cash and Bank account for package booking.');
        if (receivable > 0 && !receivableAcc) throw new Error('Missing Accounts Receivable account for package booking.');
        if (vendorPayable > 0 && !payableAcc) throw new Error('Missing Vendor Payables account for package booking.');
        if (revenue > 0 && !salesAcc) throw new Error('Missing Sales Revenue account for package booking.');
        if (tax > 0 && !taxAcc) throw new Error('Missing Tax Payable account for package booking.');

        const lines = [];
        if (paid > 0) {
            lines.push({ account_id: cashAcc.id, debit: paid, credit: 0, memo: 'Customer payment received' });
        }
        if (receivable > 0) {
            lines.push({ account_id: receivableAcc.id, debit: receivable, credit: 0, memo: 'Remaining customer receivable booked' });
        }
        if (vendorPayable > 0) {
            lines.push({ account_id: payableAcc.id, debit: 0, credit: vendorPayable, memo: vendorId ? `Vendor payable booked for ${vendorId}` : 'Vendor payable booked' });
        }
        if (revenue > 0) {
            lines.push({ account_id: salesAcc.id, debit: 0, credit: revenue, memo: 'Platform package revenue recognized' });
        }
        if (tax > 0) {
            lines.push({ account_id: taxAcc.id, debit: 0, credit: tax, memo: 'Package tax payable booked' });
        }

        if (lines.length < 2) return null;

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'booking',
                description: `Package booking ${bookingRef || String(bookingId).slice(0, 8)}${packageName ? ` - ${packageName}` : ''}`,
                reference_type: 'PackageBooking',
                reference_id: String(bookingId),
                party_type: 'package_booking',
                party_id: String(bookingId),
                created_by: userId,
                metadata: { bookingRef, packageName, vendorId },
                lines
            },
            transaction
        );
    }

    async recordPackageRemainingPayment({ bookingId, bookingRef, amount = 0, paymentReference = null } = {}, userId = null, transaction = null) {
        if (!bookingId) throw new Error('Package booking id is required for remaining payment accounting.');

        const toMoney = value => Math.round(Number(value || 0) * 100) / 100;
        const value = toMoney(amount);
        if (!value || value <= 0) return null;

        const referenceId = paymentReference ? `${bookingId}:${paymentReference}` : String(bookingId);
        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'PackageBookingRemainingPayment', reference_id: String(referenceId) },
            transaction
        });
        if (existing) return existing;

        const cashAcc = await this.repo.getAccountByCode('1000', transaction);
        const receivableAcc = await this.repo.getAccountByCode('1100', transaction);
        if (!cashAcc) throw new Error('Missing Cash and Bank account for remaining payment.');
        if (!receivableAcc) throw new Error('Missing Accounts Receivable account for remaining payment.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'receipt',
                description: `Remaining payment received for package booking ${bookingRef || String(bookingId).slice(0, 8)}`,
                reference_type: 'PackageBookingRemainingPayment',
                reference_id: String(referenceId),
                party_type: 'package_booking',
                party_id: String(bookingId),
                created_by: userId,
                lines: [
                    { account_id: cashAcc.id, debit: value, credit: 0, memo: 'Remaining customer payment received' },
                    { account_id: receivableAcc.id, debit: 0, credit: value, memo: 'Customer receivable settled' }
                ]
            },
            transaction
        );
    }

    async recordPackageRefund({ bookingId, bookingRef, refundAmount = 0, cancelRemainingAmount = 0, vendorReversal = 0, revenueReversal = 0, taxReversal = 0, refundReference = null, reason = null } = {}, userId = null, transaction = null) {
        if (!bookingId) throw new Error('Package booking id is required for refund accounting.');

        const toMoney = value => Math.round(Number(value || 0) * 100) / 100;
        const customerCredit = toMoney(refundAmount);
        const receivableCancel = toMoney(cancelRemainingAmount);
        let vendor = toMoney(vendorReversal);
        let revenue = toMoney(revenueReversal);
        let tax = toMoney(taxReversal);
        const creditTotal = toMoney(customerCredit + receivableCancel);

        if (!creditTotal || creditTotal <= 0) return null;

        const referenceId = refundReference ? `${bookingId}:${refundReference}` : String(bookingId);
        const existing = await this.repo.JournalEntry.findOne({
            where: { reference_type: 'PackageBookingRefund', reference_id: String(referenceId) },
            transaction
        });
        if (existing) return existing;

        const debitTotal = toMoney(vendor + revenue + tax);
        const difference = toMoney(creditTotal - debitTotal);
        if (Math.abs(difference) > 0 && Math.abs(difference) <= 0.05 && revenue + difference >= 0) {
            revenue = toMoney(revenue + difference);
        }

        if (Math.abs(toMoney(creditTotal - (vendor + revenue + tax))) > 0.01) {
            throw new Error('Package refund journal entry is not balanced.');
        }

        const customerCreditAcc = customerCredit > 0
            ? (await this.repo.getAccountByCode('2300', transaction) || await this.repo.getAccountByCode('1100', transaction))
            : null;
        const receivableAcc = receivableCancel > 0 ? await this.repo.getAccountByCode('1100', transaction) : null;
        const payableAcc = vendor > 0 ? await this.repo.getAccountByCode('2000', transaction) : null;
        const salesAcc = revenue > 0 ? await this.repo.getAccountByCode('4000', transaction) : null;
        const taxAcc = tax > 0 ? await this.repo.getAccountByCode('2100', transaction) : null;

        if (customerCredit > 0 && !customerCreditAcc) throw new Error('Missing customer account for package refund.');
        if (receivableCancel > 0 && !receivableAcc) throw new Error('Missing Accounts Receivable account for package refund.');
        if (vendor > 0 && !payableAcc) throw new Error('Missing Vendor Payables account for package refund.');
        if (revenue > 0 && !salesAcc) throw new Error('Missing Sales Revenue account for package refund.');
        if (tax > 0 && !taxAcc) throw new Error('Missing Tax Payable account for package refund.');

        const lines = [];
        if (vendor > 0) {
            lines.push({ account_id: payableAcc.id, debit: vendor, credit: 0, memo: 'Vendor payable reversed for returned package booking' });
        }
        if (revenue > 0) {
            lines.push({ account_id: salesAcc.id, debit: revenue, credit: 0, memo: 'Platform package revenue reversed' });
        }
        if (tax > 0) {
            lines.push({ account_id: taxAcc.id, debit: tax, credit: 0, memo: 'Package tax payable reversed' });
        }
        if (customerCredit > 0) {
            lines.push({ account_id: customerCreditAcc.id, debit: 0, credit: customerCredit, memo: 'Customer account credited for package refund' });
        }
        if (receivableCancel > 0) {
            lines.push({ account_id: receivableAcc.id, debit: 0, credit: receivableCancel, memo: 'Unpaid customer receivable cancelled' });
        }

        if (lines.length < 2) return null;

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'credit_note',
                description: `Package booking refund/return ${bookingRef || String(bookingId).slice(0, 8)}${reason ? ` - ${reason}` : ''}`,
                reference_type: 'PackageBookingRefund',
                reference_id: String(referenceId),
                party_type: 'package_booking',
                party_id: String(bookingId),
                created_by: userId,
                metadata: { refundReference, reason },
                lines
            },
            transaction
        );
    }

    async recordBookingRefundToWallet(bookingId, description, amount, userId = null, transaction = null) {
        const value = Number(amount || 0);
        if (!value || value <= 0) return null;

        const salesAcc   = await this.repo.getAccountByCode('4000');
        const payableAcc = await this.repo.getAccountByCode('2100'); // Customer Wallet Payables
        if (!salesAcc || !payableAcc) throw new Error('Missing required accounts for refund.');

        return await this.createVoucherJournalEntry(
            {
                voucher_type: 'credit_note',
                description: `Refund to Wallet: ${description}`,
                reference_type: 'BookingRefund',
                reference_id: String(bookingId),
                party_type: 'booking',
                party_id: String(bookingId),
                created_by: userId,
                lines: [
                    { account_id: salesAcc.id, debit: value, credit: 0, memo: 'Sales revenue reversed' },
                    { account_id: payableAcc.id, debit: 0, credit: value, memo: 'Customer wallet credited' }
                ]
            },
            transaction
        );
    }
}

module.exports = AccountingService;
