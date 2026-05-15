class VendorDashboardController {
    constructor(vendorService, walletService) {
        this.vendorService = vendorService;
        this.walletService = walletService;
    }

    async index(req, res) {
        try {
            const vendorId = req.session.user.id;
            const stats = await this.vendorService.getVendorStats(vendorId);
            const recentTransactions = await this.walletService.getTransactions(vendorId);

            res.render('vendor/dashboard', {
                title: 'Vendor Dashboard',
                stats,
                recentTransactions: recentTransactions.slice(0, 5),
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = VendorDashboardController;
