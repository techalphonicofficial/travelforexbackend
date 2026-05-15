const express = require('express');
const router = express.Router();
const {
    repositories: { pipelineRepo, leadRepo, appSettingRepo }
} = require('../container');

/**
 * @api {get} /api/v1/crm/pipelines List Pipelines
 * @description Get all active pipelines for external use
 */
router.get('/pipelines', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const simplified = pipelines.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description
        }));
        res.json({ success: true, data: simplified });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @api {get} /api/v1/crm/pipelines/:id/form Get Form Config
 * @description Get fields and stages for a specific pipeline to build external forms
 */
router.get('/pipelines/:id/form', async (req, res) => {
    try {
        const pipeline = await pipelineRepo.findById(req.params.id);
        if (!pipeline) {
            return res.status(404).json({ success: false, message: 'Pipeline not found' });
        }

        res.json({
            success: true,
            data: {
                id: pipeline.id,
                name: pipeline.name,
                stages: pipeline.stages.map(s => ({ id: s.id, name: s.name, color: s.color })),
                fields: pipeline.formFields.map(f => ({
                    id: f.id,
                    label: f.label,
                    field_key: f.field_key,
                    field_type: f.field_type,
                    options: f.options,
                    is_required: f.is_required,
                    order: f.order
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @api {post} /api/v1/crm/leads/submit Submit Lead
 * @description Submit a lead from an external source with custom fields
 */
router.post('/leads/submit', async (req, res) => {
    try {
        const {
            pipeline_id,
            name,
            email,
            phone,
            source = 'External API',
            notes,
            custom_fields = {}
        } = req.body;

        if (!pipeline_id || !name) {
            return res.status(400).json({ success: false, message: 'Pipeline ID and Name are required' });
        }

        // 1. Get Pipeline to find entry stage
        const pipeline = await pipelineRepo.findById(pipeline_id);
        if (!pipeline) {
            return res.status(404).json({ success: false, message: 'Pipeline not found' });
        }

        const entryStage = await pipelineRepo.getEntryStage(pipeline_id);
        if (!entryStage) {
            return res.status(500).json({ success: false, message: 'Pipeline has no stages configured' });
        }

        // 2. Validate required custom fields
        const missingFields = pipeline.formFields
            .filter(f => f.is_required && !custom_fields[f.field_key])
            .map(f => f.label);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Required fields missing: ${missingFields.join(', ')}` 
            });
        }

        // 3. Handle Auto-assignment (optional, from AppSettings)
        const defaultAssignee = await appSettingRepo.get('crm_default_assignee_id');

        // 4. Create Lead
        const leadData = {
            name,
            email,
            phone,
            source,
            pipeline_id,
            stage_id: entryStage.id,
            assigned_to: defaultAssignee || null,
            custom_fields,
            notes,
            status: 'active'
        };

        const lead = await leadRepo.create(leadData);

        res.status(201).json({
            success: true,
            message: 'Lead captured successfully',
            data: { id: lead.id }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
