class WalletRepository {
    constructor(Wallet, WalletTransaction) {
        this.Wallet = Wallet;
        this.WalletTransaction = WalletTransaction;
    }

    async findByUserId(userId) {
        return await this.Wallet.findOne({
            where: { user_id: userId },
            include: [{ model: this.WalletTransaction, as: 'transactions' }]
        });
    }

    async createWallet(userId) {
        return await this.Wallet.create({
            user_id: userId,
            balance: 0.00
        });
    }

    async addTransaction(walletId, amount, type, description, referenceId = null) {
        const transaction = await this.WalletTransaction.create({
            wallet_id: walletId,
            amount,
            type,
            description,
            reference_id: referenceId,
            status: 'completed'
        });

        // Update balance
        const wallet = await this.Wallet.findByPk(walletId);
        let newBalance = parseFloat(wallet.balance);
        if (type === 'credit') {
            newBalance += parseFloat(amount);
        } else {
            newBalance -= parseFloat(amount);
        }

        await wallet.update({ balance: newBalance });
        return transaction;
    }

    async getTransactionHistory(walletId) {
        return await this.WalletTransaction.findAll({
            where: { wallet_id: walletId },
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = WalletRepository;
