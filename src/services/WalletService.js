class WalletService {
    constructor(walletRepo, accountingService) {
        this.walletRepo = walletRepo;
        this.accountingService = accountingService;
    }

    async getWallet(userId) {
        let wallet = await this.walletRepo.findByUserId(userId);
        if (!wallet) {
            wallet = await this.walletRepo.createWallet(userId);
        }
        return wallet;
    }

    async credit(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        const transaction = await this.walletRepo.addTransaction(wallet.id, amount, 'credit', description, referenceId);
        
        // Record Accounting Entry for Wallet Top-up / Vendor Credit
        if (this.accountingService) {
            try {
                await this.accountingService.recordWalletTopup(amount, transaction.id, userId);
            } catch (err) {
                console.error("Accounting Sync Error on Credit:", err.message);
            }
        }
        return transaction;
    }

    async refundToWallet(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        const transaction = await this.walletRepo.addTransaction(wallet.id, amount, 'credit', description, referenceId);
        
        // Record Accounting Entry for Refund
        if (this.accountingService) {
            try {
                if (typeof this.accountingService.recordBookingRefundToWallet === 'function') {
                    await this.accountingService.recordBookingRefundToWallet(referenceId, description, amount, userId);
                }
            } catch (err) {
                console.error("Accounting Sync Error on Refund:", err.message);
            }
        }
        return transaction;
    }

    async debit(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
            throw new Error('Insufficient balance');
        }
        const transaction = await this.walletRepo.addTransaction(wallet.id, amount, 'debit', description, referenceId);

        // Record Accounting Entry for Vendor Payout / Debit
        if (this.accountingService) {
            try {
                await this.accountingService.recordVendorPayout(amount, transaction.id, userId);
            } catch (err) {
                console.error("Accounting Sync Error on Debit:", err.message);
            }
        }
        return transaction;
    }

    async getTransactions(userId) {
        const wallet = await this.getWallet(userId);
        return await this.walletRepo.getTransactionHistory(wallet.id);
    }

    async requestTopUp(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        return await this.walletRepo.addPendingTransaction(wallet.id, amount, 'credit', description, referenceId);
    }

    async requestWithdrawal(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        return await this.walletRepo.addPendingTransaction(wallet.id, amount, 'debit', description, referenceId);
    }

    async getAllPendingRequests() {
        return await this.walletRepo.getAllPendingRequests();
    }

    async approveRequest(transactionId, adminUserId = null) {
        const transaction = await this.walletRepo.updateTransactionStatus(transactionId, 'completed');
        if (transaction && this.accountingService) {
            try {
                // Determine user id from wallet if not passed explicitly
                const wallet = await this.walletRepo.Wallet.findByPk(transaction.wallet_id);
                const vendorUserId = adminUserId || wallet.user_id;

                if (transaction.type === 'credit') {
                    await this.accountingService.recordWalletTopup(transaction.amount, transaction.id, vendorUserId);
                } else if (transaction.type === 'debit') {
                    await this.accountingService.recordVendorPayout(transaction.amount, transaction.id, vendorUserId);
                }
            } catch (err) {
                console.error("Accounting Sync Error on Approval:", err.message);
            }
        }
        return transaction;
    }

    async rejectRequest(transactionId) {
        return await this.walletRepo.updateTransactionStatus(transactionId, 'failed');
    }
}

module.exports = WalletService;
