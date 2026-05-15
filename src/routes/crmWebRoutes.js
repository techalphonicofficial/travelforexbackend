const express = require('express');
const router = express.Router();
const {
    db,
    repositories: { pipelineRepo, leadRepo, followUpRepo, appSettingRepo, userRepo },
    models: { Pipeline, PipelineStage, LeadFormField, Lead, LeadFollowUp }
} = require('../container');

// ─────────────────────────────────────────────
// PIPELINES
// ─────────────────────────────────────────────
router.get('/pipelines', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findAll();
        res.render('crm/pipelines/index', { title: 'CRM Pipelines', pipelines });
    } catch (err) { res.status(500).send(err.message); }
});

router.get('/pipelines/create', async (req, res) => {
    res.render('crm/pipelines/form', { title: 'Create Pipeline', pipeline: null });
});

router.get('/pipelines/:id/edit', async (req, res) => {
    try {
        const pipeline = await pipelineRepo.findById(req.params.id);
        if (!pipeline) return res.status(404).send('Pipeline not found');
        res.render('crm/pipelines/form', { title: 'Edit Pipeline', pipeline });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/pipelines/save', async (req, res) => {
    try {
        const { id, name, description, is_active, stages } = req.body;
        const parsedStages = typeof stages === 'string' ? JSON.parse(stages) : (stages || []);
        const data = { name, description, is_active: is_active === 'on' || is_active === 'true' };
        if (id) {
            await pipelineRepo.update(id, data, parsedStages);
        } else {
            await pipelineRepo.create(data, parsedStages);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/pipelines/:id', async (req, res) => {
    try {
        await pipelineRepo.delete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/pipelines/stage/:stageId', async (req, res) => {
    try {
        await pipelineRepo.deleteStage(req.params.stageId);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// FORM BUILDER (Dynamic Fields per pipeline)
// ─────────────────────────────────────────────
router.get('/form-builder', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const selectedPipelineId = req.query.pipeline_id || (pipelines[0] ? pipelines[0].id : null);
        const pipeline = selectedPipelineId ? await pipelineRepo.findById(selectedPipelineId) : null;
        res.render('crm/form-builder/index', { title: 'CRM Form Builder', pipelines, pipeline, selectedPipelineId });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/form-builder/save-field', async (req, res) => {
    try {
        const { id, pipeline_id, label, field_key, field_type, options, is_required, order } = req.body;
        const parsedOptions = typeof options === 'string' ? JSON.parse(options || '[]') : (options || []);
        const data = {
            pipeline_id, label,
            field_key: field_key || label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            field_type, options: parsedOptions,
            is_required: is_required === 'on' || is_required === true,
            order: parseInt(order) || 0
        };
        if (id) {
            await LeadFormField.update(data, { where: { id } });
        } else {
            await LeadFormField.create(data);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/form-builder/field/:id', async (req, res) => {
    try {
        await LeadFormField.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/form-builder/reorder', async (req, res) => {
    try {
        const { order } = req.body; // array of { id, order }
        for (const item of order) {
            await LeadFormField.update({ order: item.order }, { where: { id: item.id } });
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// LEADS
// ─────────────────────────────────────────────
router.get('/leads', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const selectedPipelineId = req.query.pipeline_id || (pipelines[0] ? pipelines[0].id : null);
        const filters = { ...req.query };
        if (selectedPipelineId) filters.pipeline_id = selectedPipelineId;
        const leads = await leadRepo.findAll(filters);
        const pipeline = selectedPipelineId ? await pipelineRepo.findById(selectedPipelineId) : null;
        const users = await userRepo.findAll();
        // Today's follow-up count for badge
        const todayFollowUps = await followUpRepo.findTodayPending();
        res.render('crm/leads/index', {
            title: 'CRM Leads',
            leads, pipelines, pipeline, selectedPipelineId, users,
            todayFollowUpCount: todayFollowUps.length
        });
    } catch (err) { res.status(500).send(err.message); }
});

router.get('/leads/create', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const users = await userRepo.findAll();
        // Check for auto-assign pipeline from AppSettings
        const defaultPipelineSetting = await appSettingRepo.get('crm_default_pipeline_id');
        const defaultPipelineId = defaultPipelineSetting ? parseInt(defaultPipelineSetting) : null;
        const defaultPipeline = defaultPipelineId ? await pipelineRepo.findById(defaultPipelineId) : (pipelines[0] || null);
        res.render('crm/leads/form', {
            title: 'Create Lead', lead: null, pipelines, users, defaultPipeline
        });
    } catch (err) { res.status(500).send(err.message); }
});

router.get('/leads/:id/edit', async (req, res) => {
    try {
        const lead = await leadRepo.findById(req.params.id);
        if (!lead) return res.status(404).send('Lead not found');
        const pipelines = await pipelineRepo.findActive();
        const users = await userRepo.findAll();
        const currentPipeline = lead.pipeline_id ? await pipelineRepo.findById(lead.pipeline_id) : null;
        res.render('crm/leads/form', { title: 'Edit Lead', lead, pipelines, users, defaultPipeline: currentPipeline });
    } catch (err) { res.status(500).send(err.message); }
});

router.get('/leads/:id', async (req, res) => {
    try {
        const lead = await leadRepo.findById(req.params.id);
        if (!lead) return res.status(404).send('Lead not found');
        const followUps = await followUpRepo.findByLead(req.params.id);
        const pipeline = lead.pipeline_id ? await pipelineRepo.findById(lead.pipeline_id) : null;
        res.render('crm/leads/detail', { title: `Lead: ${lead.name}`, lead, followUps, pipeline });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/leads/save', async (req, res) => {
    try {
        const { id, name, email, phone, source, pipeline_id, stage_id, assigned_to, notes, status, custom_fields } = req.body;
        const parsedCustom = typeof custom_fields === 'string' ? JSON.parse(custom_fields || '{}') : (custom_fields || {});
        const data = { name, email, phone, source, pipeline_id: pipeline_id || null, stage_id: stage_id || null, assigned_to: assigned_to || null, notes, status: status || 'active', custom_fields: parsedCustom };
        let lead;
        if (id) {
            lead = await leadRepo.update(id, data);
        } else {
            lead = await leadRepo.create(data);
        }
        res.json({ success: true, id: lead.id });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/leads/:id/move-stage', async (req, res) => {
    try {
        const { stage_id } = req.body;
        await leadRepo.moveStage(req.params.id, stage_id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/leads/:id', async (req, res) => {
    try {
        await leadRepo.delete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// FOLLOW-UPS
// ─────────────────────────────────────────────
router.get('/follow-ups', async (req, res) => {
    try {
        const followUps = await followUpRepo.findAll();
        const todayFollowUps = await followUpRepo.findTodayPending();
        res.render('crm/followups/index', { title: 'CRM Follow-ups', followUps, todayFollowUps });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/follow-ups/save', async (req, res) => {
    try {
        const { lead_id, follow_up_date, follow_up_time, follow_up_type, notes } = req.body;
        const created_by = req.session?.user?.id || null;
        await followUpRepo.create({ lead_id, follow_up_date, follow_up_time, follow_up_type, notes, status: 'pending', created_by });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/follow-ups/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await followUpRepo.updateStatus(req.params.id, status);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/follow-ups/:id', async (req, res) => {
    try {
        await followUpRepo.delete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// CRM SETTINGS
// ─────────────────────────────────────────────
router.get('/settings', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const defaultPipelineId = await appSettingRepo.get('crm_default_pipeline_id');
        const defaultAssigneeId = await appSettingRepo.get('crm_default_assignee_id');
        const users = await userRepo.findAll();
        res.render('crm/settings/index', { title: 'CRM Settings', pipelines, defaultPipelineId, defaultAssigneeId, users });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/settings/save', async (req, res) => {
    try {
        const { crm_default_pipeline_id, crm_default_assignee_id } = req.body;
        await appSettingRepo.set('crm_default_pipeline_id', crm_default_pipeline_id || '');
        await appSettingRepo.set('crm_default_assignee_id', crm_default_assignee_id || '');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// API HELPERS (used by frontend dynamically)
// ─────────────────────────────────────────────
router.get('/api/pipeline/:id/fields', async (req, res) => {
    try {
        const fields = await LeadFormField.findAll({
            where: { pipeline_id: req.params.id },
            order: [['order', 'ASC']]
        });
        res.json({ success: true, fields });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/api/pipeline/:id/stages', async (req, res) => {
    try {
        const stages = await PipelineStage.findAll({
            where: { pipeline_id: req.params.id },
            order: [['order', 'ASC']]
        });
        res.json({ success: true, stages });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
