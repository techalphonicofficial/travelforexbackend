class VendorService {
    constructor(packageRepo, walletService) {
        this.packageRepo = packageRepo;
        this.walletService = walletService;
    }

    async getVendorStats(vendorId) {
        const packages = await this.packageRepo.model.findAll({
            where: { vendor_id: vendorId }
        });
        const PackageBooking = this.packageRepo.model.sequelize.models.PackageBooking;
        const bookingRows = PackageBooking
            ? await PackageBooking.findAll({ where: { vendor_id: vendorId } })
            : [];

        const wallet = await this.walletService.getWallet(vendorId);
        const totalBookingValue = bookingRows.reduce((sum, booking) => sum + parseFloat(booking.package_total || 0), 0);
        const vendorPayableValue = bookingRows.reduce((sum, booking) => sum + parseFloat(booking.vendor_amount || 0), 0);

        return {
            totalPackages: packages.length,
            activePackages: packages.filter(p => p.status).length,
            totalBookings: bookingRows.length,
            totalBookingValue,
            vendorPayableValue,
            walletBalance: wallet.balance,
            currency: wallet.currency
        };
    }

    async getVendorRecentBookings(vendorId, limit = 5) {
        const PackageBooking = this.packageRepo.model.sequelize.models.PackageBooking;
        if (!PackageBooking) return [];

        return await PackageBooking.findAll({
            where: { vendor_id: vendorId },
            order: [['created_at', 'DESC']],
            limit
        });
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
