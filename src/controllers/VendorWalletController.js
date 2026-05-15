class VendorWalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }

    async index(req, res) {
        try {
            const vendorId = req.session.user.id;
            const wallet = await this.walletService.getWallet(vendorId);
            const transactions = await this.walletService.getTransactions(vendorId);

            res.render('vendor/wallet/index', {
                title: 'My Wallet',
                wallet,
                transactions,
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Wallet Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = VendorWalletController;
