class VendorService {
    constructor(packageRepo, walletService) {
        this.packageRepo = packageRepo;
        this.walletService = walletService;
    }

    async getVendorStats(vendorId) {
        const packages = await this.packageRepo.model.findAll({
            where: { vendor_id: vendorId }
        });

        const wallet = await this.walletService.getWallet(vendorId);

        return {
            totalPackages: packages.length,
            activePackages: packages.filter(p => p.status).length,
            walletBalance: wallet.balance,
            currency: wallet.currency
        };
    }

    async getVendorPackages(vendorId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return await this.packageRepo.model.findAndCountAll({
            where: { vendor_id: vendorId },
            include: [
                { 
                    model: this.packageRepo.packageDestinationModel, 
                    as: 'destinations',
                    include: [{ model: this.packageRepo.destinationModel, as: 'destination' }]
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = VendorService;
