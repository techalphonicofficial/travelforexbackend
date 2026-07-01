class AccountingController {
    constructor(accountingService) {
        this.service = accountingService;
    }

    async dashboard(req, res) {
        try {
            const [stats, recentEntries, monthlyRevenue] = await Promise.all([
                this.service.getDashboardStats(),
                this.service.getRecentEntries(6),
                this.service.getMonthlyRevenue()
            ]);
            res.render('admin/accounting/dashboard', {
                title: 'Accounting Dashboard',
                user: req.session.user,
                stats,
                recentEntries,
                monthlyRevenue: JSON.stringify(monthlyRevenue)
            });
        } catch (error) {
            console.error('Accounting Dashboard Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async ledger(req, res) {
        try {
            const page  = parseInt(req.query.page) || 1;
            const limit = 25;
            const filters = {
                dateFrom: req.query.dateFrom || null,
                dateTo:   req.query.dateTo   || null,
                ref_type: req.query.ref_type || null,
                voucher_type: req.query.voucher_type || null,
                voucher_no: req.query.voucher_no || null
            };
            const data = await this.service.getLedger(page, limit, filters);
            res.render('admin/accounting/ledger', {
                title: 'General Ledger',
                user: req.session.user,
                entries:     data.rows,
                totalPages:  Math.ceil(data.count / limit),
                currentPage: page,
                totalCount:  data.count,
                filters,
                voucherTypes: this.service.getVoucherTypes()
            });
        } catch (error) {
            console.error('Ledger Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async accounts(req, res) {
        try {
            const grouped = await this.service.getAccounts();
            res.render('admin/accounting/accounts', {
                title: 'Chart of Accounts',
                user: req.session.user,
                grouped
            });
        } catch (error) {
            console.error('Accounts Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async trialBalance(req, res) {
        try {
            const { rows, totalDebit, totalCredit } = await this.service.getTrialBalance();
            res.render('admin/accounting/trial_balance', {
                title: 'Trial Balance',
                user: req.session.user,
                rows,
                totalDebit,
                totalCredit,
                isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
            });
        } catch (error) {
            console.error('Trial Balance Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async pnl(req, res) {
        try {
            const dateFrom = req.query.dateFrom || null;
            const dateTo   = req.query.dateTo   || null;
            const data = await this.service.getPnL(dateFrom, dateTo);
            res.render('admin/accounting/pnl', {
                title: 'Profit & Loss Statement',
                user: req.session.user,
                ...data,
                dateFrom,
                dateTo
            });
        } catch (error) {
            console.error('P&L Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async newJournal(req, res) {
        try {
            const accounts = await this.service.getChartOfAccounts();
            res.render('admin/accounting/journal_new', {
                title: 'New Voucher',
                user: req.session.user,
                accounts,
                voucherTypes: this.service.getVoucherTypes(),
                error: null
            });
        } catch (error) {
            console.error('New Journal Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async createJournal(req, res) {
        try {
            const { voucher_type, description, entry_date, reference_type, reference_id } = req.body;

            // Collect lines from form arrays
            const accountIds = [].concat(req.body['account_id[]'] || []);
            const debits     = [].concat(req.body['debit[]']      || []);
            const credits    = [].concat(req.body['credit[]']     || []);
            const memos      = [].concat(req.body['memo[]']       || []);

            const lines = accountIds.map((acc_id, i) => ({
                account_id: acc_id,
                debit:  parseFloat(debits[i]  || 0),
                credit: parseFloat(credits[i] || 0),
                memo:   memos[i] || null
            })).filter(l => l.account_id && (l.debit > 0 || l.credit > 0));

            await this.service.createManualJournalEntry({
                voucher_type: voucher_type || 'journal',
                description,
                entry_date,
                reference_type,
                reference_id,
                lines,
                created_by: req.session.user?.id || null
            });

            res.redirect('/accounting/vouchers?success=1');
        } catch (error) {
            console.error('Create Journal Error:', error);
            const accounts = await this.service.getChartOfAccounts();
            res.render('admin/accounting/journal_new', {
                title: 'New Voucher',
                user: req.session.user,
                accounts,
                voucherTypes: this.service.getVoucherTypes(),
                error: error.message
            });
        }
    }

    async vouchers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 25;
            const filters = {
                voucher_type: req.query.voucher_type || null,
                status: req.query.status || null,
                dateFrom: req.query.dateFrom || null,
                dateTo: req.query.dateTo || null,
                search: req.query.search || null
            };
            const data = await this.service.getVouchers(page, limit, filters);
            res.render('admin/accounting/vouchers', {
                title: 'Accounting Vouchers',
                user: req.session.user,
                vouchers: data.rows,
                totalPages: Math.ceil(data.count / limit),
                currentPage: page,
                totalCount: data.count,
                filters,
                voucherTypes: this.service.getVoucherTypes(),
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Voucher List Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }

    async voucherDetail(req, res) {
        try {
            const voucher = await this.service.getVoucherById(req.params.id);
            if (!voucher) return res.status(404).send('Voucher not found');

            res.render('admin/accounting/voucher_detail', {
                title: `Voucher ${voucher.voucher_no}`,
                user: req.session.user,
                voucher,
                voucherTypes: this.service.getVoucherTypes()
            });
        } catch (error) {
            console.error('Voucher Detail Error:', error);
            res.status(500).send('Server Error: ' + error.message);
        }
    }
}

module.exports = AccountingController;
