class PipelineRepository {
    constructor(Pipeline, PipelineStage, LeadFormField) {
        this.Pipeline = Pipeline;
        this.PipelineStage = PipelineStage;
        this.LeadFormField = LeadFormField;
    }

    async findAll() {
        return this.Pipeline.findAll({
            include: [{ model: this.PipelineStage, as: 'stages', order: [['order', 'ASC']] }],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return this.Pipeline.findByPk(id, {
            include: [
                { model: this.PipelineStage, as: 'stages', order: [['order', 'ASC']] },
                { model: this.LeadFormField, as: 'formFields', order: [['order', 'ASC']] }
            ]
        });
    }

    async findActive() {
        return this.Pipeline.findAll({
            where: { is_active: true },
            include: [{ model: this.PipelineStage, as: 'stages', order: [['order', 'ASC']] }],
            order: [['name', 'ASC']]
        });
    }

    async findActiveForSelection() {
        return this.Pipeline.findAll({
            attributes: ['id', 'name'],
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
    }

    async create(data, stages = []) {
        const pipeline = await this.Pipeline.create(data);
        if (stages.length) {
            await this.PipelineStage.bulkCreate(stages.map((s, i) => ({
                ...s, pipeline_id: pipeline.id, order: i
            })));
        }
        return pipeline;
    }

    async update(id, data, stages = []) {
        const pipeline = await this.Pipeline.findByPk(id);
        if (!pipeline) return null;
        await pipeline.update(data);

        if (stages.length) {
            // Preserve existing stages by ID, add/update
            for (let i = 0; i < stages.length; i++) {
                const s = stages[i];
                if (s.id) {
                    await this.PipelineStage.update({ name: s.name, color: s.color, order: i }, { where: { id: s.id } });
                } else {
                    await this.PipelineStage.create({ ...s, pipeline_id: id, order: i });
                }
            }
        }
        return pipeline;
    }

    async deleteStage(stageId) {
        return this.PipelineStage.destroy({ where: { id: stageId } });
    }

    async getEntryStage(pipelineId) {
        return this.PipelineStage.findOne({
            where: { pipeline_id: pipelineId },
            order: [['order', 'ASC']]
        });
    }

    async delete(id) {
        const pipeline = await this.Pipeline.findByPk(id);
        if (!pipeline) return null;
        return pipeline.destroy();
    }
}

module.exports = PipelineRepository;
