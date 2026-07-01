class AccountingRepository {
    constructor(Account, JournalEntry, JournalEntryLine, sequelize, Voucher = null, VoucherSequence = null) {
        this.Account = Account;
        this.JournalEntry = JournalEntry;
        this.JournalEntryLine = JournalEntryLine;
        this.sequelize = sequelize;
        this.Voucher = Voucher;
        this.VoucherSequence = VoucherSequence;
        this.voucherPrefixes = {
            receipt: 'RV',
            payment: 'PV',
            journal: 'JV',
            contra: 'CV',
            credit_note: 'CN',
            debit_note: 'DN',
            booking: 'BK',
            sales: 'SV',
            refund: 'RF'
        };
    }

    async getAccountByCode(code, transaction = null) {
        return await this.Account.findOne({ where: { code }, transaction });
    }

    async getAllAccounts() {
        return await this.Account.findAll({ order: [['code', 'ASC']] });
    }

    async createJournalEntry(data, lines, transaction = null) {
        const t = transaction || await this.sequelize.transaction();
        try {
            const entry = await this.JournalEntry.create(data, { transaction: t });
            for (const line of lines) {
                await this.JournalEntryLine.create({
                    ...line,
                    journal_entry_id: entry.id
                }, { transaction: t });
            }
            if (!transaction) await t.commit();
            return entry;
        } catch (error) {
            if (!transaction) await t.rollback();
            throw error;
        }
    }

    getFinancialYear(date = new Date()) {
        const value = date instanceof Date ? date : new Date(date);
        const year = value.getFullYear();
        const month = value.getMonth();
        const startYear = month >= 3 ? year : year - 1;
        return `${startYear}-${String(startYear + 1).slice(-2)}`;
    }

    getVoucherPrefix(voucherType) {
        const normalizedType = String(voucherType || 'journal').toLowerCase();
        return this.voucherPrefixes[normalizedType] || normalizedType.slice(0, 2).toUpperCase() || 'JV';
    }

    async getNextVoucherNumber(voucherType, voucherDate, transaction) {
        const normalizedType = String(voucherType || 'journal').toLowerCase();
        const financialYear = this.getFinancialYear(voucherDate);
        const prefix = this.getVoucherPrefix(normalizedType);

        let sequence = await this.VoucherSequence.findOne({
            where: { voucher_type: normalizedType, financial_year: financialYear },
            transaction,
            lock: transaction?.LOCK?.UPDATE || true
        });

        if (!sequence) {
            sequence = await this.VoucherSequence.create({
                voucher_type: normalizedType,
                financial_year: financialYear,
                prefix,
                current_number: 0
            }, { transaction });
        }

        const nextNumber = Number(sequence.current_number || 0) + 1;
        await sequence.update({ current_number: nextNumber, prefix }, { transaction });
        const compactYear = financialYear.replace('-', '');
        return `${prefix}-${compactYear}-${String(nextNumber).padStart(5, '0')}`;
    }

    async createVoucherWithJournalEntry(voucherData, journalData, lines, transaction = null) {
        if (!this.Voucher || !this.VoucherSequence) {
            return await this.createJournalEntry(journalData, lines, transaction);
        }

        const t = transaction || await this.sequelize.transaction();
        try {
            const voucherDate = voucherData.voucher_date ? new Date(voucherData.voucher_date) : new Date();
            const voucherType = String(voucherData.voucher_type || 'journal').toLowerCase();
            const voucherNo = voucherData.voucher_no || await this.getNextVoucherNumber(voucherType, voucherDate, t);
            const status = voucherData.status || 'posted';

            const voucher = await this.Voucher.create({
                ...voucherData,
                voucher_no: voucherNo,
                voucher_type: voucherType,
                voucher_date: voucherDate,
                financial_year: voucherData.financial_year || this.getFinancialYear(voucherDate),
                status,
                posted_at: voucherData.posted_at || (status === 'posted' ? new Date() : null)
            }, { transaction: t });

            const entry = await this.JournalEntry.create({
                ...journalData,
                voucher_id: voucher.id
            }, { transaction: t });

            for (const line of lines) {
                await this.JournalEntryLine.create({
                    ...line,
                    journal_entry_id: entry.id
                }, { transaction: t });
            }

            if (!transaction) await t.commit();
            entry.setDataValue('voucher', voucher);
            return entry;
        } catch (error) {
            if (!transaction) await t.rollback();
            throw error;
        }
    }

    async getLedger(limit = 50, offset = 0, filters = {}) {
        const { Op } = require('sequelize');
        const where = {};
        if (filters.dateFrom) where.entry_date = { [Op.gte]: new Date(filters.dateFrom) };
        if (filters.dateTo)   where.entry_date = { ...(where.entry_date || {}), [Op.lte]: new Date(filters.dateTo + 'T23:59:59') };
        if (filters.ref_type) where.reference_type = filters.ref_type;
        const voucherWhere = {};
        if (filters.voucher_type) voucherWhere.voucher_type = filters.voucher_type;
        if (filters.voucher_no) voucherWhere.voucher_no = { [Op.iLike]: `%${filters.voucher_no}%` };

        const include = [{
            model: this.JournalEntryLine,
            as: 'lines',
            include: [{ model: this.Account, as: 'account' }]
        }];

        if (this.Voucher) {
            include.push({
                model: this.Voucher,
                as: 'voucher',
                required: Object.keys(voucherWhere).length > 0,
                where: voucherWhere
            });
        }

        return await this.JournalEntry.findAndCountAll({
            where,
            include,
            distinct: true,
            order: [['entry_date', 'DESC']],
            limit,
            offset
        });
    }

    async getVouchers(limit = 50, offset = 0, filters = {}) {
        if (!this.Voucher) return { rows: [], count: 0 };
        const { Op } = require('sequelize');
        const where = {};
        if (filters.voucher_type) where.voucher_type = filters.voucher_type;
        if (filters.status) where.status = filters.status;
        if (filters.dateFrom) where.voucher_date = { [Op.gte]: new Date(filters.dateFrom) };
        if (filters.dateTo) where.voucher_date = { ...(where.voucher_date || {}), [Op.lte]: new Date(filters.dateTo + 'T23:59:59') };
        if (filters.search) {
            where[Op.or] = [
                { voucher_no: { [Op.iLike]: `%${filters.search}%` } },
                { reference_type: { [Op.iLike]: `%${filters.search}%` } },
                { reference_id: { [Op.iLike]: `%${filters.search}%` } },
                { narration: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }

        return await this.Voucher.findAndCountAll({
            where,
            include: [{
                model: this.JournalEntry,
                as: 'journalEntry',
                required: false,
                include: [{
                    model: this.JournalEntryLine,
                    as: 'lines',
                    include: [{ model: this.Account, as: 'account' }]
                }]
            }],
            distinct: true,
            order: [['voucher_date', 'DESC'], ['created_at', 'DESC']],
            limit,
            offset
        });
    }

    async getVoucherById(id) {
        if (!this.Voucher) return null;
        return await this.Voucher.findByPk(id, {
            include: [{
                model: this.JournalEntry,
                as: 'journalEntry',
                include: [{
                    model: this.JournalEntryLine,
                    as: 'lines',
                    include: [{ model: this.Account, as: 'account' }]
                }]
            }]
        });
    }

    async getDashboardStats() {
        const [results] = await this.sequelize.query(`
            SELECT
                a.code,
                a.name,
                a.type,
                COALESCE(SUM(jel.debit), 0)  AS total_debit,
                COALESCE(SUM(jel.credit), 0) AS total_credit
            FROM accounts a
            LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
            GROUP BY a.id, a.code, a.name, a.type
            ORDER BY a.code ASC
        `);

        const get = (code) => results.find(r => r.code === code) || { total_debit: 0, total_credit: 0 };

        // Cash balance = debits - credits on Cash account (1000)
        const cash    = get('1000');
        const cashBal = parseFloat(cash.total_debit) - parseFloat(cash.total_credit);

        // Total Revenue = sum of credits on all revenue accounts (4xxx)
        const totalRevenue = results
            .filter(r => r.type === 'revenue')
            .reduce((s, r) => s + parseFloat(r.total_credit) - parseFloat(r.total_debit), 0);

        // Total Expenses = sum of debits on all expense accounts (5xxx)
        const totalExpenses = results
            .filter(r => r.type === 'expense')
            .reduce((s, r) => s + parseFloat(r.total_debit) - parseFloat(r.total_credit), 0);

        // Vendor Payable = credits - debits on account 2000
        const vp = get('2000');
        const vendorPayable = parseFloat(vp.total_credit) - parseFloat(vp.total_debit);

        // Accounts Receivable = debits - credits on 1100
        const ar = get('1100');
        const accountsReceivable = parseFloat(ar.total_debit) - parseFloat(ar.total_credit);

        // GST Payable
        const gst = get('2100');
        const gstPayable = parseFloat(gst.total_credit) - parseFloat(gst.total_debit);

        // Net Profit
        const netProfit = totalRevenue - totalExpenses;

        // Journal entry count
        const [[{ cnt }]] = await this.sequelize.query(`SELECT COUNT(*) AS cnt FROM journal_entries`);

        return {
            cashBalance: cashBal,
            totalRevenue,
            totalExpenses,
            netProfit,
            vendorPayable,
            accountsReceivable,
            gstPayable,
            journalEntryCount: parseInt(cnt)
        };
    }

    async getTrialBalance() {
        const [results] = await this.sequelize.query(`
            SELECT
                a.code,
                a.name,
                a.type,
                COALESCE(SUM(jel.debit), 0)  AS total_debit,
                COALESCE(SUM(jel.credit), 0) AS total_credit
            FROM accounts a
            LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
            WHERE a.is_active = true
            GROUP BY a.id, a.code, a.name, a.type
            ORDER BY a.code ASC
        `);
        return results;
    }

    async getPnL(dateFrom = null, dateTo = null) {
        let dateFilter = '';
        const replacements = [];
        if (dateFrom) {
            dateFilter += ` AND je.entry_date >= $${replacements.length + 1}`;
            replacements.push(dateFrom);
        }
        if (dateTo) {
            dateFilter += ` AND je.entry_date <= $${replacements.length + 1}`;
            replacements.push(dateTo + 'T23:59:59');
        }

        const [results] = await this.sequelize.query(`
            SELECT
                a.code,
                a.name,
                a.type,
                COALESCE(SUM(jel.debit), 0)  AS total_debit,
                COALESCE(SUM(jel.credit), 0) AS total_credit
            FROM accounts a
            LEFT JOIN journal_entry_lines jel ON jel.account_id = a.id
            LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id
            WHERE a.type IN ('revenue', 'expense') ${dateFilter}
            GROUP BY a.id, a.code, a.name, a.type
            ORDER BY a.type DESC, a.code ASC
        `, { bind: replacements });

        return results;
    }

    async getRecentEntries(limit = 5) {
        const include = [{
                model: this.JournalEntryLine,
                as: 'lines',
                include: [{ model: this.Account, as: 'account' }]
            }];
        if (this.Voucher) {
            include.push({ model: this.Voucher, as: 'voucher', required: false });
        }

        return await this.JournalEntry.findAll({
            include,
            order: [['entry_date', 'DESC']],
            limit
        });
    }

    async getMonthlyRevenue() {
        const [results] = await this.sequelize.query(`
            SELECT
                TO_CHAR(je.entry_date, 'Mon YYYY') AS month,
                TO_CHAR(je.entry_date, 'YYYY-MM') AS month_key,
                COALESCE(SUM(jel.credit - jel.debit), 0) AS net_revenue
            FROM journal_entries je
            JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
            JOIN accounts a ON a.id = jel.account_id
            WHERE a.type = 'revenue'
            GROUP BY month, month_key
            ORDER BY month_key ASC
            LIMIT 6
        `);
        return results;
    }
}

module.exports = AccountingRepository;
