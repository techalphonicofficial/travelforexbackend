class WalletService {
    constructor(walletRepo) {
        this.walletRepo = walletRepo;
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
        return await this.walletRepo.addTransaction(wallet.id, amount, 'credit', description, referenceId);
    }

    async debit(userId, amount, description, referenceId = null) {
        const wallet = await this.getWallet(userId);
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
            throw new Error('Insufficient balance');
        }
        return await this.walletRepo.addTransaction(wallet.id, amount, 'debit', description, referenceId);
    }

    async getTransactions(userId) {
        const wallet = await this.getWallet(userId);
        return await this.walletRepo.getTransactionHistory(wallet.id);
    }
}

module.exports = WalletService;
