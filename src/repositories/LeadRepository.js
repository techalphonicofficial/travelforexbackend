const { Op } = require('sequelize');

class LeadRepository {
    constructor(Lead, Pipeline, PipelineStage, LeadFormField, User) {
        this.Lead = Lead;
        this.Pipeline = Pipeline;
        this.PipelineStage = PipelineStage;
        this.LeadFormField = LeadFormField;
        this.User = User;
    }

    _includes() {
        return [
            { model: this.Pipeline, as: 'pipeline', attributes: ['id', 'name'] },
            { model: this.PipelineStage, as: 'stage', attributes: ['id', 'name', 'color'] },
            { model: this.User, as: 'assignee', attributes: ['id', 'name', 'email'] }
        ];
    }

    async findAll(filters = {}) {
        const where = {};
        if (filters.pipeline_id) where.pipeline_id = filters.pipeline_id;
        if (filters.stage_id) where.stage_id = filters.stage_id;
        if (filters.assigned_to) where.assigned_to = filters.assigned_to;
        if (filters.status) where.status = filters.status;
        if (filters.search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${filters.search}%` } },
                { email: { [Op.iLike]: `%${filters.search}%` } },
                { phone: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }
        return this.Lead.findAll({ where, include: this._includes(), order: [['created_at', 'DESC']] });
    }

    async findById(id) {
        return this.Lead.findByPk(id, { include: this._includes() });
    }

    async findByPipeline(pipelineId) {
        return this.Lead.findAll({
            where: { pipeline_id: pipelineId },
            include: this._includes(),
            order: [['created_at', 'DESC']]
        });
    }

    async findByCustomerId(customerId) {
        return this.Lead.findAll({
            where: { customer_id: customerId },
            include: this._includes(),
            order: [['created_at', 'DESC']]
        });
    }

    async create(data) {
        return this.Lead.create(data);
    }

    async update(id, data) {
        const lead = await this.Lead.findByPk(id);
        if (!lead) return null;
        return lead.update(data);
    }

    async moveStage(id, stageId) {
        return this.Lead.update({ stage_id: stageId }, { where: { id } });
    }

    async delete(id) {
        const lead = await this.Lead.findByPk(id);
        if (!lead) return null;
        return lead.destroy();
    }

    async countByStage(pipelineId) {
        const leads = await this.Lead.findAll({ where: { pipeline_id: pipelineId }, attributes: ['stage_id'] });
        const counts = {};
        leads.forEach(l => { counts[l.stage_id] = (counts[l.stage_id] || 0) + 1; });
        return counts;
    }
}

module.exports = LeadRepository;
