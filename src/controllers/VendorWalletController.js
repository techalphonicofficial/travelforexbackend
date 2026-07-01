class VendorWalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }

    async index(req, res) {
        try {
            const vendorId = req.session.user.id;
            const wallet = await this.walletService.getWallet(vendorId);
            const transactions = await this.walletService.getTransactions(vendorId);
            
            const totalWithdrawn = transactions
                .filter(tx => tx.type === 'debit' && (tx.status === 'completed' || tx.status === 'pending'))
                .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

            res.render('vendor/wallet/index', {
                title: 'My Wallet',
                wallet,
                transactions,
                totalWithdrawn,
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Wallet Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async topUp(req, res) {
        try {
            const vendorId = req.session.user.id;
            const amount = req.body.amount || 0;
            if (amount <= 0) {
                return res.json({ success: false, message: 'Invalid amount' });
            }
            
            await this.walletService.requestTopUp(vendorId, amount, 'Wallet Top-up Request');
            
            res.json({ success: true, message: 'Wallet top-up request submitted. Waiting for admin approval.' });
        } catch (error) {
            console.error('Wallet TopUp Error:', error);
            res.json({ success: false, message: error.message });
        }
    }

    async withdraw(req, res) {
        try {
            const vendorId = req.session.user.id;
            const amount = req.body.amount || 0;
            if (amount <= 0) {
                return res.json({ success: false, message: 'Invalid amount' });
            }
            
            await this.walletService.requestWithdrawal(vendorId, amount, 'Wallet Withdrawal Request');
            
            res.json({ success: true, message: 'Withdrawal request submitted. Waiting for admin approval.' });
        } catch (error) {
            console.error('Wallet Withdrawal Error:', error);
            res.json({ success: false, message: error.message });
        }
    }
}

module.exports = VendorWalletController;
