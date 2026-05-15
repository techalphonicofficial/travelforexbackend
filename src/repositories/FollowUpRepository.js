const { Op } = require('sequelize');

class FollowUpRepository {
    constructor(LeadFollowUp, Lead, User) {
        this.LeadFollowUp = LeadFollowUp;
        this.Lead = Lead;
        this.User = User;
    }

    async findAll() {
        return this.LeadFollowUp.findAll({
            include: [
                { model: this.Lead, as: 'lead', attributes: ['id', 'name', 'phone', 'email'] },
                { model: this.User, as: 'creator', attributes: ['id', 'name'] }
            ],
            order: [['follow_up_date', 'ASC'], ['created_at', 'DESC']]
        });
    }

    async findTodayPending() {
        const today = new Date().toISOString().split('T')[0];
        return this.LeadFollowUp.findAll({
            where: { follow_up_date: today, status: 'pending' },
            include: [
                { model: this.Lead, as: 'lead', attributes: ['id', 'name', 'phone', 'email'] }
            ],
            order: [['follow_up_date', 'ASC']]
        });
    }

    async findByLead(leadId) {
        return this.LeadFollowUp.findAll({
            where: { lead_id: leadId },
            include: [{ model: this.User, as: 'creator', attributes: ['id', 'name'] }],
            order: [['follow_up_date', 'DESC']]
        });
    }

    async findUpcoming(days = 7) {
        const today = new Date().toISOString().split('T')[0];
        const future = new Date();
        future.setDate(future.getDate() + days);
        const futureStr = future.toISOString().split('T')[0];
        return this.LeadFollowUp.findAll({
            where: { follow_up_date: { [Op.between]: [today, futureStr] }, status: 'pending' },
            include: [{ model: this.Lead, as: 'lead', attributes: ['id', 'name', 'phone'] }],
            order: [['follow_up_date', 'ASC']]
        });
    }

    async create(data) {
        return this.LeadFollowUp.create(data);
    }

    async updateStatus(id, status) {
        return this.LeadFollowUp.update({ status }, { where: { id } });
    }

    async delete(id) {
        const record = await this.LeadFollowUp.findByPk(id);
        if (!record) return null;
        return record.destroy();
    }
}

module.exports = FollowUpRepository;
