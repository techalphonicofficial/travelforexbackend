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

    async addPendingTransaction(walletId, amount, type, description, referenceId = null) {
        if (type === 'debit') {
            const wallet = await this.Wallet.findByPk(walletId);
            if (parseFloat(wallet.balance) < parseFloat(amount)) {
                throw new Error('Insufficient balance');
            }
            await wallet.update({ balance: parseFloat(wallet.balance) - parseFloat(amount) });
        }
        
        return await this.WalletTransaction.create({
            wallet_id: walletId,
            amount,
            type,
            description,
            reference_id: referenceId,
            status: 'pending' // For credit, balance is not updated yet. For debit, balance is deducted immediately.
        });
    }

    async updateTransactionStatus(transactionId, status) {
        const transaction = await this.WalletTransaction.findByPk(transactionId);
        if (!transaction) return null;
        
        await transaction.update({ status });
        
        if (status === 'completed' && transaction.type === 'credit') {
            const wallet = await this.Wallet.findByPk(transaction.wallet_id);
            let newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
            await wallet.update({ balance: newBalance });
        } else if (status === 'failed' && transaction.type === 'debit') {
            // Refund the deducted balance
            const wallet = await this.Wallet.findByPk(transaction.wallet_id);
            let newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
            await wallet.update({ balance: newBalance });
        }
        
        return transaction;
    }

    async getAllPendingRequests() {
        return await this.WalletTransaction.findAll({
            where: { status: 'pending' },
            include: [{
                model: this.Wallet,
                as: 'wallet',
                include: ['user'] // Assuming Wallet belongsTo User
            }],
            order: [['created_at', 'DESC']]
        });
    }

    async getTransactionHistory(walletId) {
        return await this.WalletTransaction.findAll({
            where: { wallet_id: walletId },
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = WalletRepository;
