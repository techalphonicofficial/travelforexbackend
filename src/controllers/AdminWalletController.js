class AdminWalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }

    async requests(req, res) {
        try {
            const requests = await this.walletService.getAllPendingRequests();
            
            res.render('admin/wallets/requests', {
                title: 'Wallet Fund Requests',
                requests,
                user: req.session.user
            });
        } catch (error) {
            console.error('Admin Wallet Requests Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async approve(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.session.user.id;
            
            await this.walletService.approveRequest(id, adminId);
            
            res.redirect('/admin/wallets/requests?success=approved');
        } catch (error) {
            console.error('Admin Wallet Approve Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async reject(req, res) {
        try {
            const { id } = req.params;
            
            await this.walletService.rejectRequest(id);
            
            res.redirect('/admin/wallets/requests?success=rejected');
        } catch (error) {
            console.error('Admin Wallet Reject Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AdminWalletController;
