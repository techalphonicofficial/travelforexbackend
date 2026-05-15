const BaseRepository = require('./BaseRepository');

class CustomerRepository extends BaseRepository {
    constructor(Customer, User) {
        super(Customer);
        this.User = User;
    }

    async findByUserId(userId) {
        return this.model.findOne({
            where: { user_id: userId },
            include: [{ model: this.User, as: 'user' }]
        });
    }

    async getProfile(userId) {
        return this.User.findOne({
            where: { id: userId },
            include: [{ model: this.model, as: 'customerProfile' }],
            attributes: { exclude: ['password'] }
        });
    }
}

module.exports = CustomerRepository;
