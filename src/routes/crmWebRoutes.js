const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
    THEME_COLOUR_DEFINITIONS,
    loadThemeColours,
    normalizeThemeColours,
    parseThemeValues
} = require('../utils/themeColours');
const {
    db,
    repositories: { pipelineRepo, leadRepo, followUpRepo, appSettingRepo, themeRepo, userRepo, categoryRepo },
    services: { accountingService },
    models: { Pipeline, PipelineStage, LeadFormField, Lead, LeadFollowUp, User, Customer, CancellationRule }
} = require('../container');

// Multer Storage Configuration for CRM Settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/settings';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|svg|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed!'));
    }
});

function clampPercentage(value) {
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), 100);
}

function parseCancellationRules(value) {
    if (!value) return [];
    let rows = value;
    if (typeof value === 'string') {
        try {
            rows = JSON.parse(value);
        } catch (_) {
            return [];
        }
    }
    if (!Array.isArray(rows)) return [];

    return rows.map(row => {
        const minDays = Math.max(parseInt(row.min_days_before_departure, 10) || 0, 0);
        const maxDays = Math.max(parseInt(row.max_days_before_departure, 10) || 0, minDays);
        return {
            min_days_before_departure: Math.min(minDays, maxDays),
            max_days_before_departure: Math.max(minDays, maxDays),
            refund_percentage: clampPercentage(row.refund_percentage).toFixed(2),
            cancellation_percentage: clampPercentage(row.cancellation_percentage).toFixed(2),
            description: row.description ? String(row.description).trim().slice(0, 255) : null,
            is_active: row.is_active === true || row.is_active === 'true' || row.is_active === 'on' || row.is_active === 1 || row.is_active === '1'
        };
    });
}

function handleUpload(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            next();
        });
    };
}

function isWonStage(stage) {
    const name = String(stage?.name || '').toLowerCase();
    return ['won', 'closed won', 'booking confirmed', 'booked', 'converted'].some(token => name.includes(token));
}

function extractLeadAmount(customFields = {}) {
    const amountKeys = ['amount', 'deal_amount', 'deal_value', 'booking_amount', 'package_amount', 'total_amount', 'price'];
    for (const key of amountKeys) {
        const raw = customFields[key];
        if (raw === undefined || raw === null || raw === '') continue;
        const amount = Number(String(raw).replace(/[^0-9.]/g, ''));
        if (amount > 0) return amount;
    }
    return 0;
}

async function convertLeadToCustomer(lead, transaction, sessionUserId = null) {
    if (!lead) return null;

    const fullLead = await Lead.findByPk(lead.id, { transaction });
    if (!fullLead) return null;

    let user = null;
    if (fullLead.customer_id) {
        user = await User.findByPk(fullLead.customer_id, { transaction });
    }

    if (!user && fullLead.email) {
        user = await User.findOne({ where: { email: fullLead.email }, transaction });
    }

    if (!user) {
        const fallbackEmail = `lead-${fullLead.id}@picktrails.local`;
        const password = await bcrypt.hash(`lead-${fullLead.id}-${Date.now()}`, 10);
        user = await User.create({
            name: fullLead.name,
            email: fullLead.email || fallbackEmail,
            phone_number: fullLead.phone || null,
            password,
            type: 'customer',
            role_id: null,
            status: true
        }, { transaction });
    } else if (user.type !== 'customer') {
        throw new Error('Lead email already belongs to a non-customer user.');
    }

    let customer = await Customer.findOne({ where: { user_id: user.id }, transaction });
    if (!customer) {
        customer = await Customer.create({
            user_id: user.id,
            phone: fullLead.phone || user.phone_number || null
        }, { transaction });
    }

    await fullLead.update({
        customer_id: user.id,
        status: 'won'
    }, { transaction });

    const amount = extractLeadAmount(fullLead.custom_fields || {});
    await accountingService.recordLeadWonBooking(amount, fullLead.id, sessionUserId, transaction);

    return { user, customer, amount };
}

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
        const users = await userRepo.findEmployees();
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
        const users = await userRepo.findEmployees();
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
        const users = await userRepo.findEmployees();
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
    const transaction = await db.transaction();
    try {
        const { id, name, email, phone, source, pipeline_id, stage_id, assigned_to, notes, status, custom_fields } = req.body;
        const parsedCustom = typeof custom_fields === 'string' ? JSON.parse(custom_fields || '{}') : (custom_fields || {});
        let finalAssignedTo = assigned_to || null;

        // For NEW leads: apply round-robin auto-assignment if no assignee selected
        if (!id && !finalAssignedTo) {
            const assignmentType = await appSettingRepo.get('crm_assignment_type') || 'manual';
            if (assignmentType === 'round_robin') {
                const nextEmployee = await userRepo.getNextRoundRobinAssignee(Lead);
                if (nextEmployee) finalAssignedTo = nextEmployee.id;
            } else {
                // Manual mode: use default assignee if set
                const defaultAssignee = await appSettingRepo.get('crm_default_assignee_id');
                if (defaultAssignee) finalAssignedTo = defaultAssignee;
            }
        }

        const data = { name, email, phone, source, pipeline_id: pipeline_id || null, stage_id: stage_id || null, assigned_to: finalAssignedTo, notes, status: status || 'active', custom_fields: parsedCustom };
        let lead;
        if (id) {
            lead = await Lead.findByPk(id, { transaction });
            if (!lead) throw new Error('Lead not found');
            await lead.update(data, { transaction });
        } else {
            lead = await Lead.create(data, { transaction });
        }
        const selectedStage = stage_id ? await PipelineStage.findByPk(stage_id, { transaction }) : null;
        if (data.status === 'won' || isWonStage(selectedStage)) {
            await convertLeadToCustomer(lead, transaction, req.session?.user?.id || null);
        }
        await transaction.commit();
        res.json({ success: true, id: lead.id });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/leads/:id/move-stage', async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { stage_id } = req.body;
        const lead = await Lead.findByPk(req.params.id, { transaction });
        if (!lead) throw new Error('Lead not found');

        const stage = await PipelineStage.findByPk(stage_id, { transaction });
        await lead.update({
            stage_id,
            status: isWonStage(stage) ? 'won' : lead.status
        }, { transaction });

        let conversion = null;
        if (isWonStage(stage)) {
            conversion = await convertLeadToCustomer(lead, transaction, req.session?.user?.id || null);
        }

        await transaction.commit();
        res.json({
            success: true,
            converted: !!conversion,
            amount: conversion?.amount || 0
        });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
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
        const assignmentType = await appSettingRepo.get('crm_assignment_type') || 'manual';
        
        // Add categories and mapping
        const categories = await categoryRepo.findAll();
        const rawMapping = await appSettingRepo.get('crm_category_pipeline_mapping');
        const categoryPipelineMapping = rawMapping ? JSON.parse(rawMapping) : {};

        // API Integration settings
        const crmApiKey = await appSettingRepo.get('crm_api_key') || '';
        const crmWebhookUrl = await appSettingRepo.get('crm_webhook_url') || '';
        const crmWebhookEnabled = await appSettingRepo.get('crm_webhook_enabled') || 'false';
        const partialBookingEnabled = await appSettingRepo.get('crm_partial_booking_enabled') || 'false';
        const partialBookingPercentage = await appSettingRepo.get('crm_partial_booking_percentage') || '0';
        const forexServiceChargeType = await appSettingRepo.get('forex_service_charge_type') || 'percent';
        const forexServiceChargeValue = await appSettingRepo.get('forex_service_charge_value') || '0';
        const activeTheme = await themeRepo.findActive();
        const themeRecords = await themeRepo.findAllOrdered();
        const theme_colours = await loadThemeColours(appSettingRepo, themeRepo);
        const theme_primary_color = theme_colours.theme_brand_primary;

        // Company info
        const company_name = await appSettingRepo.get('company_name') || '';
        const razorpay_key_id = await appSettingRepo.get('razorpay_key_id') || '';
        const razorpay_key_secret = await appSettingRepo.get('razorpay_key_secret') || '';
        const company_phone = await appSettingRepo.get('company_phone') || '';
        const company_whatsapp = await appSettingRepo.get('company_whatsapp') || '';
        const company_email = await appSettingRepo.get('company_email') || '';
        const social_facebook = await appSettingRepo.get('social_facebook') || '';
        const social_twitter = await appSettingRepo.get('social_twitter') || '';
        const social_youtube = await appSettingRepo.get('social_youtube') || '';
        const social_instagram = await appSettingRepo.get('social_instagram') || '';
        const company_office_address = await appSettingRepo.get('company_office_address') || '';
        const company_map_coordinates = await appSettingRepo.get('company_map_coordinates') || '';
        const company_logo_url = await appSettingRepo.get('company_logo_url') || '';

        // Tax Types
        const rawTaxTypes = await appSettingRepo.get('tax_types');
        let tax_types = [];
        if (rawTaxTypes) {
            try { tax_types = JSON.parse(rawTaxTypes); } catch (e) { }
        }
        const cancellationRules = await CancellationRule.findAll({
            order: [
                ['min_days_before_departure', 'ASC'],
                ['max_days_before_departure', 'ASC']
            ]
        });

        const users = await userRepo.findEmployees();
        res.render('crm/settings/index', { 
            title: 'CRM Settings', 
            pipelines, 
            defaultPipelineId, 
            defaultAssigneeId,
            assignmentType,
            users,
            categories,
            categoryPipelineMapping,
            crmApiKey,
            crmWebhookUrl,
            crmWebhookEnabled,
            partialBookingEnabled,
            partialBookingPercentage,
            forexServiceChargeType,
            forexServiceChargeValue,
            theme_colours,
            theme_colour_definitions: THEME_COLOUR_DEFINITIONS,
            theme_themes: themeRecords.map(row => ({
                id: row.id,
                name: row.name,
                is_active: row.is_active,
                values: normalizeThemeColours(parseThemeValues(row.values))
            })),
            active_theme_id: activeTheme ? activeTheme.id : '',
            theme_primary_color,
            company_name,
            razorpay_key_id,
            razorpay_key_secret,
            company_phone,
            company_whatsapp,
            company_email,
            social_facebook,
            social_twitter,
            social_youtube,
            social_instagram,
            company_office_address,
            company_map_coordinates,
            company_logo_url,
            tax_types,
            cancellationRules: cancellationRules.map(row => row.get ? row.get({ plain: true }) : row)
        });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/settings/save', async (req, res) => {
    try {
        const { 
            crm_default_pipeline_id, crm_default_assignee_id, crm_category_pipeline_mapping, 
            assignment_type, crm_webhook_url, crm_webhook_enabled,
            partial_booking_enabled, partial_booking_percentage,
            forex_service_charge_type, forex_service_charge_value,
            company_name, razorpay_key_id, razorpay_key_secret, company_phone, company_whatsapp, company_email,
            social_facebook, social_twitter, social_youtube, social_instagram, 
            company_office_address, company_map_coordinates, tax_types, cancellation_rules,
            theme_id, theme_name
        } = req.body;
        const normalizedPartialPercent = Math.min(Math.max(parseFloat(partial_booking_percentage) || 0, 0), 100).toFixed(2);
        const normalizedForexChargeType = forex_service_charge_type === 'fixed' ? 'fixed' : 'percent';
        const normalizedForexChargeValue = Math.max(parseFloat(forex_service_charge_value) || 0, 0).toFixed(2);
        const normalizedThemeColours = normalizeThemeColours({
            ...req.body,
            theme_brand_primary: req.body.theme_brand_primary || req.body.theme_primary_color
        });
        
        await appSettingRepo.set('crm_default_pipeline_id', crm_default_pipeline_id || '');
        await appSettingRepo.set('crm_default_assignee_id', crm_default_assignee_id || '');
        await appSettingRepo.set('crm_assignment_type', assignment_type || 'manual');
        await appSettingRepo.set('crm_webhook_url', crm_webhook_url || '');
        await appSettingRepo.set('crm_webhook_enabled', crm_webhook_enabled === 'on' || crm_webhook_enabled === 'true' ? 'true' : 'false');
        await appSettingRepo.set('crm_partial_booking_enabled', partial_booking_enabled === 'on' || partial_booking_enabled === 'true' ? 'true' : 'false');
        await appSettingRepo.set('crm_partial_booking_percentage', normalizedPartialPercent);
        await appSettingRepo.set('forex_service_charge_type', normalizedForexChargeType);
        await appSettingRepo.set('forex_service_charge_value', normalizedForexChargeValue);
        await Promise.all(THEME_COLOUR_DEFINITIONS.map(item => (
            appSettingRepo.set(item.key, normalizedThemeColours[item.key])
        )));
        await appSettingRepo.set('theme_primary_color', normalizedThemeColours.theme_brand_primary);
        const activeTheme = await themeRepo.saveAndActivate({
            id: theme_id || null,
            name: theme_name || 'Default Theme',
            values: normalizedThemeColours
        });
        
        await appSettingRepo.set('company_name', company_name || '');
        await appSettingRepo.set('razorpay_key_id', razorpay_key_id || '');
        await appSettingRepo.set('razorpay_key_secret', razorpay_key_secret || '');
        await appSettingRepo.set('company_phone', company_phone || '');
        await appSettingRepo.set('company_whatsapp', company_whatsapp || '');
        await appSettingRepo.set('company_email', company_email || '');
        await appSettingRepo.set('social_facebook', social_facebook || '');
        await appSettingRepo.set('social_twitter', social_twitter || '');
        await appSettingRepo.set('social_youtube', social_youtube || '');
        await appSettingRepo.set('social_instagram', social_instagram || '');
        await appSettingRepo.set('company_office_address', company_office_address || '');
        await appSettingRepo.set('company_map_coordinates', company_map_coordinates || '');
        
        if (tax_types) {
            await appSettingRepo.set('tax_types', typeof tax_types === 'string' ? tax_types : JSON.stringify(tax_types));
        }
        
        if (crm_category_pipeline_mapping) {
            await appSettingRepo.set('crm_category_pipeline_mapping', crm_category_pipeline_mapping);
        }

        if (cancellation_rules !== undefined) {
            const parsedCancellationRules = parseCancellationRules(cancellation_rules);
            await db.transaction(async transaction => {
                await CancellationRule.destroy({ where: {}, transaction });
                if (parsedCancellationRules.length) {
                    await CancellationRule.bulkCreate(parsedCancellationRules, { transaction });
                }
            });
        }

        res.json({ success: true, active_theme_id: activeTheme ? activeTheme.id : '' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Generate / Regenerate API Key
router.post('/settings/generate-api-key', async (req, res) => {
    try {
        const newKey = 'pt_' + crypto.randomBytes(24).toString('hex');
        await appSettingRepo.set('crm_api_key', newKey);
        res.json({ success: true, key: newKey });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Webhook Helper ────────────────────────────────────────────────────────────
async function fireWebhook(event, data) {
    try {
        const enabled = await appSettingRepo.get('crm_webhook_enabled');
        if (enabled !== 'true') return;
        const url = await appSettingRepo.get('crm_webhook_url');
        if (!url) return;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'PickTrails-CRM/1.0' },
            body: JSON.stringify({ event, timestamp: new Date().toISOString(), data }),
            signal: AbortSignal.timeout(8000)
        });
    } catch (_) { /* Webhook errors should not break the main flow */ }
}

// Test Webhook
router.post('/settings/test-webhook', async (req, res) => {
    try {
        // Use URL from request body (form field), fallback to DB
        const webhookUrl = req.body.webhook_url || await appSettingRepo.get('crm_webhook_url');
        if (!webhookUrl) return res.status(400).json({ success: false, message: 'No webhook URL configured. Please enter a URL first.' });

        const payload = {
            event: 'test.ping',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test ping from PickTrails CRM' }
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'PickTrails-CRM/1.0' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000)
        });

        res.json({ success: true, status: response.status, statusText: response.statusText });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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

// ─────────────────────────────────────────────
// API TESTER (In-Dashboard Playground)
// ─────────────────────────────────────────────

// In-memory webhook log store (cleared on server restart)
const webhookLogs = [];
const sseClients = new Set();

// Page
router.get('/api-tester', async (req, res) => {
    try {
        const pipelines = await pipelineRepo.findActive();
        const apiKey = await appSettingRepo.get('crm_api_key') || '';
        const receiverUrl = `${req.protocol}://${req.get('host')}/crm/webhook-receiver`;
        res.render('crm/api-tester/index', {
            title: 'CRM API Tester',
            pipelines,
            apiKey,
            receiverUrl
        });
    } catch (err) { res.status(500).send(err.message); }
});

// Built-in Webhook Receiver — 3rd party POST here
router.post('/webhook-receiver', (req, res) => {
    const log = {
        id: Date.now(),
        time: new Date().toISOString(),
        method: req.method,
        headers: req.headers,
        body: req.body
    };
    webhookLogs.unshift(log);
    if (webhookLogs.length > 50) webhookLogs.pop(); // keep last 50

    // Notify all connected SSE clients
    const data = `data: ${JSON.stringify(log)}\n\n`;
    sseClients.forEach(client => client.write(data));

    res.json({ success: true, message: 'Webhook received' });
});

// SSE — Live stream of incoming webhooks
router.get('/webhook-receiver/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send existing logs on connect
    res.write(`data: ${JSON.stringify({ type: 'init', logs: webhookLogs })}\n\n`);

    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
});

// Get all logs (JSON)
router.get('/webhook-receiver/logs', (req, res) => {
    res.json({ success: true, logs: webhookLogs });
});

// Clear logs
router.delete('/webhook-receiver/logs', (req, res) => {
    webhookLogs.length = 0;
    sseClients.forEach(client => client.write(`data: ${JSON.stringify({ type: 'clear' })}\n\n`));
    res.json({ success: true });
});

module.exports = router;
