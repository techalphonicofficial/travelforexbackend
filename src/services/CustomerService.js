class CustomerService {
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }

    async getCustomerProfile(userId) {
        return this.customerRepo.getProfile(userId);
    }

    async updateProfile(userId, data) {
        const customer = await this.customerRepo.findByUserId(userId);
        if (!customer) throw new Error('Customer profile not found');
        
        return this.customerRepo.update(customer.id, data);
    }
}

module.exports = CustomerService;
