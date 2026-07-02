                                                                                            const express = require('express');
                                                                                            const router = express.Router();
                                                                                            const {
                                                                                                repositories: { pipelineRepo, leadRepo, appSettingRepo, themeRepo, userRepo },
                                                                                                models: { Lead }
                                                                                            } = require('../container');
                                                                                            const {
                                                                                                THEME_COLOUR_DEFINITIONS,
                                                                                                buildThemeCssVariables,
                                                                                                loadThemeColours,
                                                                                                toRgbTriplet
                                                                                            } = require('../utils/themeColours');

                                                                                            // ── API Key Middleware ────────────────────────────────────────
                                                                                            // If crm_api_key is set, require x-api-key header or ?api_key query param
                                                                                            async function apiKeyAuth(req, res, next) {
                                                                                                try {
                                                                                                    const savedKey = await appSettingRepo.get('crm_api_key');
                                                                                                    if (!savedKey) return next(); // No key set — open access
                                                                                                    const provided = req.headers['x-api-key'] || req.query.api_key;
                                                                                                    if (!provided || provided !== savedKey) {
                                                                                                        return res.status(401).json({ success: false, message: 'Invalid or missing API key. Send it via x-api-key header.' });
                                                                                                    }
                                                                                                    next();
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            }

                                                                                            router.use(apiKeyAuth);

                                                                                            // ── Webhook Helper ────────────────────────────────────────────
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

                                                                                            function clampPercent(value) {
                                                                                                const parsed = parseFloat(value);
                                                                                                if (!Number.isFinite(parsed)) return 0;
                                                                                                return Math.min(Math.max(parsed, 0), 100);
                                                                                            }

                                                                                            const DEFAULT_TAX_TYPES = [
                                                                                                { name: 'GST', percent: 5 },
                                                                                                { name: 'IGST', percent: 18 },
                                                                                                { name: 'SGST', percent: 9 },
                                                                                                { name: 'CGST', percent: 9 }
                                                                                            ];

                                                                                            function parseTaxTypes(value) {
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

                                                                                                return rows
                                                                                                    .map(row => {
                                                                                                        const name = String(row?.name || row?.tax_name || '').trim();
                                                                                                        if (!name) return null;

                                                                                                        const percent = clampPercent(
                                                                                                            row?.percent ?? row?.default_percent ?? row?.default_percentage
                                                                                                        );

                                                                                                        return {
                                                                                                            name,
                                                                                                            percent,
                                                                                                            default_percent: percent
                                                                                                        };
                                                                                                    })
                                                                                                    .filter(Boolean);
                                                                                            }

                                                                                            function buildThemeColourResponse(themeColours) {
                                                                                                return {
                                                                                                    values: themeColours,
                                                                                                    definitions: THEME_COLOUR_DEFINITIONS.map(item => ({
                                                                                                        key: item.key,
                                                                                                        css_var: item.cssVar,
                                                                                                        label: item.label,
                                                                                                        group: item.group,
                                                                                                        type: item.type,
                                                                                                        value: themeColours[item.key]
                                                                                                    })),
                                                                                                    css_variables: buildThemeCssVariables(themeColours),
                                                                                                    rgb_variables: {
                                                                                                        '--bs-primary-rgb': toRgbTriplet(themeColours.theme_brand_primary),
                                                                                                        '--bs-secondary-rgb': toRgbTriplet(themeColours.theme_brand_secondary)
                                                                                                    }
                                                                                                };
                                                                                            }

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
                                                                                            * @swagger
                                                                                            * /api/v1/crm/settings/company-info:
                                                                                            *   get:
                                                                                            *     summary: Get company info and integration keys
                                                                                            *     description: Retrieve public company info, social links, contact info, and Razorpay keys.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Successfully retrieved company info and settings
                                                                                            *         content:
                                                                                            *           application/json:
                                                                                            *             schema:
                                                                                            *               type: object
                                                                                            *               properties:
                                                                                            *                 success:
                                                                                            *                   type: boolean
                                                                                            *                 data:
                                                                                            *                   type: object
                                                                                            *                   properties:
                                                                                            *                     payment:
                                                                                            *                       type: object
                                                                                            *                       properties:
                                                                                            *                         razorpay_key_id:
                                                                                            *                           type: string
                                                                                            *                         razorpay_key_secret:
                                                                                            *                           type: string
                                                                                            *                     contact:
                                                                                            *                       type: object
                                                                                            *                       properties:
                                                                                            *                         phone:
                                                                                            *                           type: string
                                                                                            *                         whatsapp:
                                                                                            *                           type: string
                                                                                            *                         email:
                                                                                            *                           type: string
                                                                                            *                         office_address:
                                                                                            *                           type: string
                                                                                            *                         map_coordinates:
                                                                                            *                           type: string
                                                                                            *                     social:
                                                                                            *                       type: object
                                                                                            *                       properties:
                                                                                            *                         facebook:
                                                                                            *                           type: string
                                                                                            *                         twitter:
                                                                                            *                           type: string
                                                                                            *                         youtube:
                                                                                            *                           type: string
                                                                                            *                         instagram:
                                                                                            *                           type: string
                                                                                            *                     footer_content:
                                                                                            *                       type: string
                                                                                            *                     company_logo_url:
                                                                                            *                       type: string
                                                                                            *                     footer_columns:
                                                                                            *                       type: object
                                                                                            *                       description: Nested object containing arrays of links for company, explore, support, and trust_safety columns
                                                                                            *       401:
                                                                                            *         description: Unauthorized - Invalid API Key
                                                                                            *       500:
                                                                                            *         description: Internal Server Error
                                                                                            */
                                                                                            router.get('/settings/company-info', async (req, res) => {
                                                                                                try {
                                                                                                    const company_name = await appSettingRepo.get('company_name') || '';
                                                                                                    const razorpay_key_id = await appSettingRepo.get('razorpay_key_id') || '';
                                                                                                    const razorpay_key_secret = await appSettingRepo.get('razorpay_key_secret') || '';
                                                                                                    const company_phone = await appSettingRepo.get('company_phone') || '';
                                                                                                    const company_whatsapp = await appSettingRepo.get('company_whatsapp') || '';
                                                                                                    const company_email = await appSettingRepo.get('company_email') || '';
                                                                                                    const company_office_address = await appSettingRepo.get('company_office_address') || '';
                                                                                                    const company_map_coordinates = await appSettingRepo.get('company_map_coordinates') || '';
                                                                                                    const social_facebook = await appSettingRepo.get('social_facebook') || '';
                                                                                                    const social_twitter = await appSettingRepo.get('social_twitter') || '';
                                                                                                    const social_youtube = await appSettingRepo.get('social_youtube') || '';
                                                                                                    const social_instagram = await appSettingRepo.get('social_instagram') || '';
                                                                                                    const footer_content = await appSettingRepo.get('footer_content') || '';
                                                                                                    
                                                                                                    const company_logo_url = await appSettingRepo.get('company_logo_url') || '';
                                                                                                    const rawFooterColumns = await appSettingRepo.get('footer_columns');
                                                                                                    let footer_columns = { company: [], explore: [], support: [], trust_safety: [] };
                                                                                                    if (rawFooterColumns) {
                                                                                                        try { footer_columns = JSON.parse(rawFooterColumns); } catch (e) { }
                                                                                                    }

                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data: {
                                                                                                            company_name,
                                                                                                            payment: {
                                                                                                                razorpay_key_id,
                                                                                                                razorpay_key_secret // Keep this secure if accessed from public clients
                                                                                                            },
                                                                                                            contact: {
                                                                                                                phone: company_phone,
                                                                                                                whatsapp: company_whatsapp,
                                                                                                                email: company_email,
                                                                                                                office_address: company_office_address,
                                                                                                                map_coordinates: company_map_coordinates
                                                                                                            },
                                                                                                            social: {
                                                                                                                facebook: social_facebook,
                                                                                                                twitter: social_twitter,
                                                                                                                youtube: social_youtube,
                                                                                                                instagram: social_instagram
                                                                                                            },
                                                                                                            footer_content,
                                                                                                            company_logo_url,
                                                                                                            footer_columns
                                                                                                        }
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/settings/partial-booking:
                                                                                            *   get:
                                                                                            *     summary: Get partial booking settings
                                                                                            *     description: Retrieve the partial booking enabled flag and booking percentage configured in CRM settings.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Partial booking settings
                                                                                            *       401:
                                                                                            *         description: Unauthorized - Invalid API Key
                                                                                            */
                                                                                            router.get('/settings/partial-booking', async (req, res) => {
                                                                                                try {
                                                                                                    const enabledValue = await appSettingRepo.get('crm_partial_booking_enabled') || 'false';
                                                                                                    const percentValue = await appSettingRepo.get('crm_partial_booking_percentage') || '0';
                                                                                                    const enabled = enabledValue === 'true';
                                                                                                    const percentage = clampPercent(percentValue);

                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data: {
                                                                                                            partial_booking_enabled: enabled,
                                                                                                            partial_booking_percentage: percentage
                                                                                                        }
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/settings/forex-service-charge:
                                                                                            *   get:
                                                                                            *     summary: Get forex service charge
                                                                                            *     description: Retrieve the forex service charge type and value configured in CRM settings.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Forex service charge settings
                                                                                            *       401:
                                                                                            *         description: Unauthorized - Invalid API Key
                                                                                            */
                                                                                            router.get('/settings/forex-service-charge', async (req, res) => {
                                                                                                try {
                                                                                                    const typeValue = await appSettingRepo.get('forex_service_charge_type') || 'percent';
                                                                                                    const rawValue = await appSettingRepo.get('forex_service_charge_value') || '0';
                                                                                                    const value = Math.max(parseFloat(rawValue) || 0, 0);
                                                                                                    const type = typeValue === 'fixed' ? 'fixed' : 'percent';

                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data: {
                                                                                                            forex_service_charge_type: type,
                                                                                                            forex_service_charge_value: Number(value.toFixed(2)),
                                                                                                            currency: 'INR'
                                                                                                        }
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/settings/taxes:
                                                                                            *   get:
                                                                                            *     summary: Get tax types
                                                                                            *     description: Retrieve tax types configured in CRM settings for destination tax dropdowns.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Tax types configured in CRM settings
                                                                                            *         content:
                                                                                            *           application/json:
                                                                                            *             schema:
                                                                                            *               type: object
                                                                                            *               properties:
                                                                                            *                 success:
                                                                                            *                   type: boolean
                                                                                            *                 data:
                                                                                            *                   type: array
                                                                                            *                   items:
                                                                                            *                     type: object
                                                                                            *                     properties:
                                                                                            *                       name:
                                                                                            *                         type: string
                                                                                            *                         example: GST
                                                                                            *                       percent:
                                                                                            *                         type: number
                                                                                            *                         example: 5
                                                                                            *                       default_percent:
                                                                                            *                         type: number
                                                                                            *                         example: 5
                                                                                            *       401:
                                                                                            *         description: Unauthorized - Invalid API Key
                                                                                            */
                                                                                            router.get('/settings/taxes', async (req, res) => {
                                                                                                try {
                                                                                                    const rawTaxTypes = await appSettingRepo.get('tax_types');
                                                                                                    const taxTypes = parseTaxTypes(rawTaxTypes);
                                                                                                    const data = taxTypes.length ? taxTypes : parseTaxTypes(DEFAULT_TAX_TYPES);

                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/settings/theme-colours:
                                                                                            *   get:
                                                                                            *     summary: Get theme colours
                                                                                            *     description: Retrieve the CRM theme colour settings and CSS variable aliases.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Theme colour settings
                                                                                            *         content:
                                                                                            *           application/json:
                                                                                            *             schema:
                                                                                            *               type: object
                                                                                            *               properties:
                                                                                            *                 success:
                                                                                            *                   type: boolean
                                                                                            *                   example: true
                                                                                            *                 data:
                                                                                            *                   type: object
                                                                                            *                   properties:
                                                                                            *                     values:
                                                                                            *                       type: object
                                                                                            *                       additionalProperties:
                                                                                            *                         type: string
                                                                                            *                       example:
                                                                                            *                         theme_brand_primary: "#026eb5"
                                                                                            *                         theme_brand_secondary: "#fdce2e"
                                                                                            *                     css_variables:
                                                                                            *                       type: object
                                                                                            *                       additionalProperties:
                                                                                            *                         type: string
                                                                                            *                       example:
                                                                                            *                         --brand-primary: "#026eb5"
                                                                                            *                         --color-primary: "var(--brand-primary)"
                                                                                            *                         --bs-primary: "var(--color-primary)"
                                                                                            *                     rgb_variables:
                                                                                            *                       type: object
                                                                                            *                       additionalProperties:
                                                                                            *                         type: string
                                                                                            *                       example:
                                                                                            *                         --bs-primary-rgb: "2, 110, 181"
                                                                                            *       401:
                                                                                            *         description: Unauthorized - Invalid API Key
                                                                                            */
                                                                                            router.get('/settings/theme-colours', async (req, res) => {
                                                                                                try {
                                                                                                    const themeColours = await loadThemeColours(appSettingRepo, themeRepo);
                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data: buildThemeColourResponse(themeColours)
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/pipelines/{id}/form:
                                                                                            *   get:
                                                                                            *     summary: Get Pipeline Form Configuration
                                                                                            *     description: Retrieve all required and custom fields for a specific pipeline to build external lead capture forms dynamically.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: path
                                                                                            *         name: id
                                                                                            *         required: true
                                                                                            *         schema:
                                                                                            *           type: integer
                                                                                            *         description: ID of the pipeline
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Successfully retrieved form fields
                                                                                            *         content:
                                                                                            *           application/json:
                                                                                            *             schema:
                                                                                            *               type: object
                                                                                            *               properties:
                                                                                            *                 success:
                                                                                            *                   type: boolean
                                                                                            *                 data:
                                                                                            *                   type: object
                                                                                            *                   properties:
                                                                                            *                     id:
                                                                                            *                       type: integer
                                                                                            *                     name:
                                                                                            *                       type: string
                                                                                            *                     stages:
                                                                                            *                       type: array
                                                                                            *                       items:
                                                                                            *                         type: object
                                                                                            *                         properties:
                                                                                            *                           id:
                                                                                            *                             type: integer
                                                                                            *                           name:
                                                                                            *                             type: string
                                                                                            *                           color:
                                                                                            *                             type: string
                                                                                            *                     fields:
                                                                                            *                       type: array
                                                                                            *                       items:
                                                                                            *                         type: object
                                                                                            *                         properties:
                                                                                            *                           id:
                                                                                            *                             type: string
                                                                                            *                           label:
                                                                                            *                             type: string
                                                                                            *                           field_key:
                                                                                            *                             type: string
                                                                                            *                           field_type:
                                                                                            *                             type: string
                                                                                            *                           options:
                                                                                            *                             type: array
                                                                                            *                             items:
                                                                                            *                               type: string
                                                                                            *                           is_required:
                                                                                            *                             type: boolean
                                                                                            *                           order:
                                                                                            *                             type: integer
                                                                                            *       404:
                                                                                            *         description: Pipeline not found
                                                                                            *       500:
                                                                                            *         description: Internal Server Error
                                                                                            */
                                                                                            router.get('/pipelines/:id/form', async (req, res) => {
                                                                                                try {
                                                                                                    const pipeline = await pipelineRepo.findById(req.params.id);
                                                                                                    if (!pipeline) {
                                                                                                        return res.status(404).json({ success: false, message: 'Pipeline not found' });
                                                                                                    }

                                                                                                    const baseFields = [
                                                                                                        { id: 'base_name', label: 'Full Name', field_key: 'name', field_type: 'text', options: [], is_required: true, order: -3 },
                                                                                                        { id: 'base_email', label: 'Email Address', field_key: 'email', field_type: 'email', options: [], is_required: false, order: -2 },
                                                                                                        { id: 'base_phone', label: 'Phone Number', field_key: 'phone', field_type: 'text', options: [], is_required: false, order: -1 }
                                                                                                    ];

                                                                                                    const customFields = pipeline.formFields.map(f => ({
                                                                                                        id: f.id,
                                                                                                        label: f.label,
                                                                                                        field_key: f.field_key,
                                                                                                        field_type: f.field_type,
                                                                                                        options: f.options,
                                                                                                        is_required: f.is_required,
                                                                                                        order: f.order
                                                                                                    }));

                                                                                                    res.json({
                                                                                                        success: true,
                                                                                                        data: {
                                                                                                            id: pipeline.id,
                                                                                                            name: pipeline.name,
                                                                                                            stages: pipeline.stages.map(s => ({ id: s.id, name: s.name, color: s.color })),
                                                                                                            fields: [...baseFields, ...customFields]
                                                                                                        }
                                                                                                    });
                                                                                                } catch (err) {
                                                                                                    res.status(500).json({ success: false, message: err.message });
                                                                                                }
                                                                                            });

                                                                                            /**
                                                                                            * @swagger
                                                                                            * /api/v1/crm/leads/submit:
                                                                                            *   post:
                                                                                            *     summary: Submit a Lead
                                                                                            *     description: Submit a new lead from an external source into a specific pipeline. You can pass base fields (name, email, phone) and any pipeline-specific custom fields inside the `custom_fields` object.
                                                                                            *     tags: [CRM]
                                                                                            *     parameters:
                                                                                            *       - in: header
                                                                                            *         name: x-api-key
                                                                                            *         schema:
                                                                                            *           type: string
                                                                                            *         required: false
                                                                                            *         description: CRM API Key (required if API key authentication is enabled in settings)
                                                                                            *     requestBody:
                                                                                            *       required: true
                                                                                            *       content:
                                                                                            *         application/json:
                                                                                            *           schema:
                                                                                            *             type: object
                                                                                            *             required:
                                                                                            *               - pipeline_id
                                                                                            *               - name
                                                                                            *             properties:
                                                                                            *               pipeline_id:
                                                                                            *                 type: integer
                                                                                            *                 description: ID of the pipeline to submit the lead to
                                                                                            *                 example: 1
                                                                                            *               name:
                                                                                            *                 type: string
                                                                                            *                 description: Full name of the lead
                                                                                            *                 example: "John Doe"
                                                                                            *               email:
                                                                                            *                 type: string
                                                                                            *                 description: Email address of the lead
                                                                                            *                 example: "john@example.com"
                                                                                            *               phone:
                                                                                            *                 type: string
                                                                                            *                 description: Phone number of the lead
                                                                                            *                 example: "+1234567890"
                                                                                            *               source:
                                                                                            *                 type: string
                                                                                            *                 description: Source of the lead
                                                                                            *                 example: "Website"
                                                                                            *               notes:
                                                                                            *                 type: string
                                                                                            *                 description: Any internal notes or message from the lead
                                                                                            *                 example: "I am interested in your services."
                                                                                            *               custom_fields:
                                                                                            *                 type: object
                                                                                            *                 description: Key-value pairs matching the field_key of custom form fields for this pipeline
                                                                                            *                 example:
                                                                                            *                   subject: "Inquiry about pricing"
                                                                                            *                   company_size: "10-50"
                                                                                            *     responses:
                                                                                            *       200:
                                                                                            *         description: Lead successfully captured
                                                                                            *         content:
                                                                                            *           application/json:
                                                                                            *             schema:
                                                                                            *               type: object
                                                                                            *               properties:
                                                                                            *                 success:
                                                                                            *                   type: boolean
                                                                                            *                   example: true
                                                                                            *                 message:
                                                                                            *                   type: string
                                                                                            *                   example: "Lead captured successfully"
                                                                                            *                 data:
                                                                                            *                   type: object
                                                                                            *                   properties:
                                                                                            *                     id:
                                                                                            *                       type: integer
                                                                                            *                       example: 42
                                                                                            *       400:
                                                                                            *         description: Bad Request (Missing required fields or pipeline ID)
                                                                                            *       404:
                                                                                            *         description: Pipeline not found
                                                                                            *       500:
                                                                                            *         description: Internal Server Error
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

                                                                                                    // 3. Handle Auto-assignment (from AppSettings)
                                                                                                    const assignmentType = await appSettingRepo.get('crm_assignment_type') || 'manual';
                                                                                                    let assigneeId = null;

                                                                                                    if (assignmentType === 'round_robin') {
                                                                                                        const nextEmployee = await userRepo.getNextRoundRobinAssignee(Lead);
                                                                                                        if (nextEmployee) assigneeId = nextEmployee.id;
                                                                                                    } else {
                                                                                                        const defaultAssignee = await appSettingRepo.get('crm_default_assignee_id');
                                                                                                        if (defaultAssignee) assigneeId = defaultAssignee;
                                                                                                    }

                                                                                                    // 4. Create Lead
                                                                                                    const leadData = {
                                                                                                        name,
                                                                                                        email,
                                                                                                        phone,
                                                                                                        source,
                                                                                                        pipeline_id,
                                                                                                        stage_id: entryStage.id,
                                                                                                        assigned_to: assigneeId,
                                                                                                        custom_fields,
                                                                                                        notes,
                                                                                                        status: 'active'
                                                                                                    };

                                                                                                    const lead = await leadRepo.create(leadData);

                                                                                                    // Create a Notification for the new lead from API
                                                                                                    try {
                                                                                                        const { Notification } = require('../container').models;
                                                                                                        if (Notification) {
                                                                                                            await Notification.create({
                                                                                                                title: 'New API Lead Received',
                                                                                                                message: `A new lead has been submitted via API by ${name} from source: ${source}`,
                                                                                                                type: 'new_lead',
                                                                                                                reference_id: String(lead.id)
                                                                                                            });
                                                                                                        }
                                                                                                    } catch (notifErr) {
                                                                                                        console.error("Error creating Notification for API lead:", notifErr);
                                                                                                        require('fs').appendFileSync('notif_error.log', new Date().toISOString() + ' API: ' + notifErr.stack + '\n');
                                                                                                    }

                                                                                                    // Fire webhook
                                                                                                    fireWebhook('lead.created', {
                                                                                                        id: lead.id,
                                                                                                        name,
                                                                                                        email,
                                                                                                        phone,
                                                                                                        source,
                                                                                                        pipeline_id,
                                                                                                        stage_id: entryStage.id
                                                                                                    });

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
