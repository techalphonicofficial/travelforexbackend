const express = require('express');
const router = express.Router();
const {
    db,
    repositories: {
        continentRepo, countryRepo, cityRepo,
        destinationRepo, categoryRepo, packageCategoryRepo, packageRepo, activityRepo, videoReviewRepo,
        appSettingRepo, reviewRepo, forexServiceRepo, forexConversionRateRepo,
        couponRepo, leadRepo, pipelineRepo, userRepo
    },
    models: {
        Continent, Country, City, Destination, DestinationMapping,
        DestinationCategory, Category, PackageCategory, PackageCategoryMapping, Package, Activity,
        PackageDestination, PackageInclusion, PackageExclusion, PackageHighlight, Media, VideoReview, Review, DestinationCrowdLevel, DestinationTax, Hotel,
        ForexConversionRequest, Customer, User, Lead, JournalEntry
    },
    services: {
        accountingService
    },
    controllers: {
        travelHotelController, travelActivityController
    }
} = require('../container');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'packages';
        if (req.originalUrl.includes('destinations')) folder = 'destinations';
        if (req.originalUrl.includes('reviews')) folder = 'reviews';
        if (req.originalUrl.includes('hotels')) folder = 'hotels';
        const dir = `public/uploads/${folder}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let prefix = 'pack';
        if (req.originalUrl.includes('destinations')) prefix = 'dest';
        if (req.originalUrl.includes('reviews')) prefix = 'rev';
        if (req.originalUrl.includes('hotels')) prefix = 'hotel';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|webm|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images and videos are allowed!'));
    }
});

// ──────────────────────────────────────────────────────────
// Helper: wraps multer middleware to catch all upload errors
// (including 'Request aborted') and return a clean JSON error
// instead of crashing the node process.
// ──────────────────────────────────────────────────────────
function handleUpload(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                // Silently ignore client-side aborts (e.g. ngrok drops)
                if (err.message === 'Request aborted') {
                    if (!res.headersSent) {
                        return res.status(499).json({ success: false, message: 'Upload cancelled by client.' });
                    }
                    return;
                }
                return res.status(400).json({ success: false, message: err.message });
            }
            next();
        });
    };
}

function slugifyDestinationName(name) {
    return String(name || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 220) || 'destination';
}

async function ensureUniqueDestinationSlug(value, currentId = null, transaction = null) {
    const baseSlug = slugifyDestinationName(value);
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        // Include soft-deleted rows because the database unique index includes them too.
        const existing = await Destination.findOne({
            where: { slug },
            paranoid: false,
            transaction
        });

        if (!existing || (currentId && Number(existing.id) === Number(currentId))) {
            return slug;
        }

        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

const DEFAULT_TAX_TYPES = [
    { name: 'GST', percent: 5 },
    { name: 'IGST', percent: 18 },
    { name: 'SGST', percent: 9 },
    { name: 'CGST', percent: 9 }
];

function clampPercent(value) {
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), 100);
}

function normalizePackageHighlights(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value
        .map(item => String(item && typeof item === 'object' ? (item.content || item.text || '') : item || '').trim())
        .filter(Boolean))];
}

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

            return {
                name,
                percent: clampPercent(row?.percent ?? row?.default_percent ?? row?.default_percentage)
            };
        })
        .filter(Boolean);
}

const PACKAGE_HOTELS_KEY = '_hotels';

function normalizePackageHotels(hotels) {
    if (!Array.isArray(hotels)) return [];

    return hotels
        .map((hotel, index) => {
            const hotelId = parseInt(hotel.hotelId || hotel.hotel_id || hotel.hotel || hotel.id, 10);
            const uiId = String(hotel.id || `hotel-${Date.now()}-${index}`).slice(0, 120);

            return {
                id: uiId,
                hotelId: Number.isInteger(hotelId) ? hotelId : null,
                name: String(hotel.name || '').trim().slice(0, 180),
                image: String(hotel.image || hotel.image_url || '').trim().slice(0, 255),
                starRating: parseInt(hotel.starRating || hotel.star_rating, 10) || 0,
                guestRating: parseFloat(hotel.guestRating || hotel.guest_rating) || 0,
                pricePerNight: parseFloat(hotel.pricePerNight || hotel.price_per_night) || 0,
                dayNumber: Math.max(parseInt(hotel.dayNumber || hotel.day_number, 10) || 1, 1),
                nights: parseInt(hotel.nights, 10) || 1,
                rooms: parseInt(hotel.rooms, 10) || 1,
                notes: String(hotel.notes || '').trim().slice(0, 500)
            };
        })
        .filter(hotel => hotel.hotelId || hotel.name);
}

function getPackageHotelsFromActivities(activities) {
    if (!activities || typeof activities !== 'object' || Array.isArray(activities)) return [];
    return normalizePackageHotels(activities[PACKAGE_HOTELS_KEY] || activities.hotels || []);
}

function withoutPackageHotels(activities) {
    if (!activities || typeof activities !== 'object' || Array.isArray(activities)) return {};
    const cleaned = { ...activities };
    delete cleaned[PACKAGE_HOTELS_KEY];
    delete cleaned.hotels;
    return cleaned;
}

function withPackageHotels(activities, hotels) {
    const payload = withoutPackageHotels(activities);
    const normalizedHotels = normalizePackageHotels(hotels);
    if (normalizedHotels.length) payload[PACKAGE_HOTELS_KEY] = normalizedHotels;
    return payload;
}

async function getTaxTypes() {
    const rawTaxTypes = await appSettingRepo.get('tax_types');
    const taxTypes = parseTaxTypes(rawTaxTypes);
    return taxTypes.length ? taxTypes : parseTaxTypes(DEFAULT_TAX_TYPES);
}

// ─────────────────────────────────────────────
// CONTINENTS
// ─────────────────────────────────────────────
router.post('/api/v1/continents/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ success: false, message: 'No IDs provided' });
        await Continent.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/continents', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        res.render('travel/continents/index', { title: 'Continents', continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/continents/create', async (req, res) => {
    res.render('travel/continents/form', { title: 'Create Continent', continent: null });
});

router.get('/continents/:id/edit', async (req, res) => {
    try {
        const continent = await Continent.findByPk(req.params.id);
        res.render('travel/continents/form', { title: 'Edit Continent', continent });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/continents/save', async (req, res) => {
    const { id, name } = req.body;
    try {
        if (id) await Continent.update({ name }, { where: { id } });
        else await Continent.create({ name });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// COUNTRIES
// ─────────────────────────────────────────────
router.get('/countries', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        const continents = await continentRepo.findAll();
        res.render('travel/countries/index', { title: 'Countries', countries, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/countries/create', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        res.render('travel/countries/form', { title: 'Create Country', country: null, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/countries/:id/edit', async (req, res) => {
    try {
        const country = await Country.findByPk(req.params.id);
        const continents = await continentRepo.findAll();
        res.render('travel/countries/form', { title: 'Edit Country', country, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/countries/save', async (req, res) => {
    const { id, name, continent_id } = req.body;
    try {
        if (id) await Country.update({ name, continent_id }, { where: { id } });
        else await Country.create({ name, continent_id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/countries/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Country.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ─────────────────────────────────────────────
// FOREX SERVICES
// ─────────────────────────────────────────────
router.get('/forex-services', async (req, res) => {
    try {
        const [forexServices, countries] = await Promise.all([
            forexServiceRepo.findAll(),
            countryRepo.findAll()
        ]);
        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;
        res.render('travel/forex-services/index', {
            title: 'Forex Services',
            forexServices: forexServices.map(toPlain),
            countries: countries.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ─────────────────────────────────────────────
// FOREX CONVERSION RATES
// ─────────────────────────────────────────────
router.get('/forex-rates', async (req, res) => {
    try {
        const [forexRates, countries] = await Promise.all([
            forexConversionRateRepo.findAll(),
            countryRepo.findAll()
        ]);
        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;
        res.render('travel/forex-rates/index', {
            title: 'Forex Conversion Rates',
            forexRates: forexRates.map(toPlain),
            countries: countries.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/forex-converter', async (req, res) => {
    try {
        const [rows, serviceChargeType, serviceChargeValue] = await Promise.all([
            forexConversionRateRepo.findPublic({ base_code: 'INR' }),
            appSettingRepo.get('forex_service_charge_type'),
            appSettingRepo.get('forex_service_charge_value')
        ]);
        res.render('travel/forex-converter/index', {
            title: 'Forex Converter',
            forexRates: rows.map(row => forexConversionRateRepo.serialize(row)).filter(Boolean),
            serviceChargeType: serviceChargeType === 'fixed' ? 'fixed' : 'percent',
            serviceChargeValue: Math.max(parseFloat(serviceChargeValue) || 0, 0)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/forex-service-requests', async (req, res) => {
    try {
        const rows = await ForexConversionRequest.findAll({
            include: Customer ? [{
                model: Customer,
                as: 'customer',
                attributes: ['id', 'phone', 'city', 'state'],
                include: User ? [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }] : []
            }] : [],
            order: [['created_at', 'DESC']],
            limit: 200
        });
        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;
        res.render('travel/forex-service-requests/index', {
            title: 'Forex Service Requests',
            forexRequests: rows.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const toMoney = value => Math.round(Number(value || 0) * 100) / 100;

async function forexRequestAccountingAmount(request) {
    const serviceCharge = toMoney(request.service_charge_amount);
    if (!serviceCharge || serviceCharge <= 0) return 0;

    const toCurrency = String(request.to_currency || 'INR').toUpperCase();
    if (toCurrency === 'INR') return serviceCharge;

    const rates = await forexConversionRateRepo.findPublic({ code: toCurrency, base_code: 'INR' });
    const rate = rates.find(row => Number(row.conversion_rate || 0) > 0);
    return rate ? toMoney(serviceCharge * Number(rate.conversion_rate || 0)) : 0;
}

async function resolveForexLeadDefaults() {
    const defaultPipelineId = await appSettingRepo.get('crm_default_pipeline_id');
    let pipeline = defaultPipelineId ? await pipelineRepo.findById(defaultPipelineId) : null;
    if (!pipeline) {
        const pipelines = await pipelineRepo.findActive();
        pipeline = pipelines[0] || null;
    }

    const stages = pipeline && Array.isArray(pipeline.stages)
        ? [...pipeline.stages].sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        : [];

    let assigneeId = null;
    const assignmentType = await appSettingRepo.get('crm_assignment_type') || 'manual';
    if (assignmentType === 'round_robin') {
        const employee = await userRepo.getNextRoundRobinAssignee(Lead);
        if (employee) assigneeId = employee.id;
    } else {
        assigneeId = await appSettingRepo.get('crm_default_assignee_id') || null;
    }

    return {
        pipelineId: pipeline ? pipeline.id : null,
        stageId: stages[0] ? stages[0].id : null,
        assigneeId
    };
}

router.post('/forex-service-requests/:id/convert', async (req, res) => {
    const transaction = await db.transaction();
    try {
        const request = await ForexConversionRequest.findByPk(req.params.id, {
            include: [{
                model: Customer,
                as: 'customer',
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone_number'] }]
            }],
            transaction
        });
        if (!request) throw new Error('Forex service request not found');

        const customer = request.customer || null;
        const user = customer && customer.user ? customer.user : null;
        const accountingAmount = await forexRequestAccountingAmount(request);
        const defaults = await resolveForexLeadDefaults();

        let lead = request.lead_id ? await Lead.findByPk(request.lead_id, { transaction }) : null;
        const leadCustomerId = customer?.user_id || user?.id || null;
        if (!lead) {
            lead = await Lead.create({
                name: user?.name || user?.email || `Forex Request #${request.id}`,
                email: user?.email || null,
                phone: customer?.phone || user?.phone_number || null,
                source: 'Forex Service Request',
                pipeline_id: defaults.pipelineId,
                stage_id: defaults.stageId,
                assigned_to: defaults.assigneeId,
                customer_id: leadCustomerId,
                status: 'won',
                notes: `Forex request #${request.id}: ${request.from_currency} to ${request.to_currency}`,
                custom_fields: {
                    forex_request_id: request.id,
                    customer_profile_id: request.customer_id,
                    from_currency: request.from_currency,
                    to_currency: request.to_currency,
                    amount: Number(request.amount || 0),
                    conversion_rate: Number(request.conversion_rate || 0),
                    converted_amount: Number(request.converted_amount || 0),
                    service_charge_amount: Number(request.service_charge_amount || 0),
                    total_amount: Number(request.total_amount || 0),
                    accounting_service_charge_inr: accountingAmount
                }
            }, { transaction });
        } else if (lead.status !== 'won') {
            await lead.update({ status: 'won' }, { transaction });
        }

        let journalEntry = request.journal_entry_id
            ? await JournalEntry.findByPk(request.journal_entry_id, { transaction })
            : null;
        if (!journalEntry && accountingAmount > 0) {
            journalEntry = await accountingService.recordForexConversionRequest({
                requestId: request.id,
                leadId: lead.id,
                amount: accountingAmount,
                customerName: user?.name || user?.email || null,
                userId: req.session?.user?.id || null,
                transaction
            });
        }

        await request.update({
            status: 'converted',
            lead_id: lead.id,
            journal_entry_id: journalEntry ? journalEntry.id : null,
            converted_at: request.converted_at || new Date()
        }, { transaction });

        await transaction.commit();
        res.redirect('/travel/forex-service-requests');
    } catch (err) {
        await transaction.rollback();
        res.status(500).send(err.message);
    }
});

router.post('/forex-rates/save', async (req, res) => {
    try {
        const { id } = req.body;
        const payload = forexConversionRateRepo.normalizePayload(req.body);
        const validationError = forexConversionRateRepo.validatePayload(payload);
        if (validationError) return res.status(400).send(validationError);

        if (id) {
            const forexRate = await forexConversionRateRepo.findById(id);
            if (!forexRate) return res.status(404).send('Forex conversion rate not found');
            await forexRate.update(payload);
        } else {
            await forexConversionRateRepo.model.create(payload);
        }

        res.redirect('/travel/forex-rates');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/forex-rates/:id/delete', async (req, res) => {
    try {
        const forexRate = await forexConversionRateRepo.findById(req.params.id);
        if (forexRate) await forexRate.destroy();
        res.redirect('/travel/forex-rates');
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────
const loadCouponPackages = async () => Package.findAll({
    attributes: ['id', 'name', 'slug', 'price'],
    order: [['name', 'ASC']]
});

router.get('/coupons', async (req, res) => {
    try {
        const [couponRows, packageRows] = await Promise.all([
            couponRepo.findAll(),
            loadCouponPackages()
        ]);
        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;

        res.render('travel/coupons/index', {
            title: 'Coupons',
            coupons: couponRows.map(row => couponRepo.serialize(row)).filter(Boolean),
            packages: packageRows.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/coupons/create', async (req, res) => {
    try {
        const packageRows = await loadCouponPackages();
        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;

        res.render('travel/coupons/form', {
            title: 'Add Coupon',
            coupon: null,
            packages: packageRows.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/coupons/:id/edit', async (req, res) => {
    try {
        const [coupon, packageRows] = await Promise.all([
            couponRepo.findById(req.params.id),
            loadCouponPackages()
        ]);
        if (!coupon) return res.status(404).send('Coupon not found');

        const toPlain = record => record && record.get ? record.get({ plain: true }) : record;
        res.render('travel/coupons/form', {
            title: 'Edit Coupon',
            coupon: couponRepo.serialize(coupon),
            packages: packageRows.map(toPlain)
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/coupons/save', async (req, res) => {
    try {
        const { id } = req.body;
        const payload = couponRepo.normalizePayload(req.body);
        const validationError = couponRepo.validatePayload(payload);
        if (validationError) return res.status(400).send(validationError);

        if (id) {
            const coupon = await couponRepo.findById(id);
            if (!coupon) return res.status(404).send('Coupon not found');
            await coupon.update(payload);
        } else {
            await couponRepo.create(payload);
        }

        res.redirect('/travel/coupons');
    } catch (err) {
        if (err && err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('Coupon code already exists');
        }
        res.status(500).send(err.message);
    }
});

router.post('/coupons/:id/toggle', async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (!coupon) return res.status(404).send('Coupon not found');
        await coupon.update({ is_active: coupon.is_active === false });
        res.redirect('/travel/coupons');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/coupons/:id/delete', async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (coupon) await coupon.destroy();
        res.redirect('/travel/coupons');
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ─────────────────────────────────────────────
// CITIES
// ─────────────────────────────────────────────
router.get('/cities', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        const continents = await Continent.findAll();
        res.render('travel/cities/index', { title: 'Cities', countries, continents });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/cities/create', async (req, res) => {
    try {
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/cities/form', { title: 'Create City', city: null, countries });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/cities/:id/edit', async (req, res) => {
    try {
        const city = await City.findByPk(req.params.id, {
            include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
        });
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/cities/form', { title: 'Edit City', city, countries });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/cities/save', async (req, res) => {
    const { id, name, country_id } = req.body;
    try {
        if (id) await City.update({ name, country_id }, { where: { id } });
        else await City.create({ name, country_id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/api/v1/cities/:id', async (req, res) => {
    try {
        const result = await cityRepo.delete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'City not found.' });
        res.json({ success: true, message: 'City deleted successfully.', ...result });
    } catch (err) {
        console.error('City delete failed:', err);
        res.status(500).json({ success: false, message: 'Unable to delete city.' });
    }
});

router.post('/api/v1/cities/bulk-delete', async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        if (!ids.length) {
            return res.status(400).json({ success: false, message: 'Select at least one city.' });
        }
        const result = await cityRepo.deleteMany(ids);
        res.json({ success: true, message: `${result.deleted} cities deleted successfully.`, ...result });
    } catch (err) {
        console.error('City bulk delete failed:', err);
        res.status(500).json({ success: false, message: 'Unable to delete selected cities.' });
    }
});



// ─────────────────────────────────────────────
// AIRPORTS
// ─────────────────────────────────────────────
router.get('/airports', async (req, res) => {
    try {
        res.render('travel/airports/index', { title: 'Airports' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ─────────────────────────────────────────────
// DESTINATIONS
// ─────────────────────────────────────────────
router.get('/destinations', async (req, res) => {
    try {
        const destinations = await Destination.findAll({
            include: [
                {
                    model: DestinationMapping, as: 'mappings', include: [
                        {
                            model: City, as: 'city',
                            include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
                        }
                    ]
                },
                { model: Category, as: 'categories', through: { attributes: [] } },
                { model: Media, as: 'gallery' }
            ]
        });
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        res.render('travel/destinations/index', { title: 'Destinations', destinations, continents, categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/destinations/create', async (req, res) => {
    try {
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        const rawTaxTypes = await appSettingRepo.get('tax_types');
        let taxTypes = [];
        try { if (rawTaxTypes) taxTypes = JSON.parse(rawTaxTypes); } catch(e){}
        res.render('travel/destinations/form', { title: 'Create Destination', destination: null, continents, categories, taxTypes });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/destinations/:id/edit', async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'categories' },
                { model: DestinationCrowdLevel, as: 'crowdLevels' }
            ]
        });
        const continents = await continentRepo.findAll();
        const categories = await categoryRepo.findAll();
        const rawTaxTypes = await appSettingRepo.get('tax_types');
        let taxTypes = [];
        try { if (rawTaxTypes) taxTypes = JSON.parse(rawTaxTypes); } catch(e){}
        res.render('travel/destinations/form', { title: 'Edit Destination', destination, continents, categories, taxTypes });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/destinations/save', handleUpload(upload.single('feature_image_file')), async (req, res) => {
    // If FormData is used, categories might come as 'categories[]' or 'categories'
    let categories = req.body['categories[]'] || req.body.categories;
    if (categories && !Array.isArray(categories)) categories = [categories];

    const { id, name, title, type, meta_title, meta_description, meta_keyword, schema, feature_image_alt, country } = req.body;
    const cleanName = String(name || '').trim();
    const requestedSlug = String(req.body.slug || '').trim();
    if (!cleanName) {
        return res.status(400).json({ success: false, message: 'Destination name is required.' });
    }
    const state = req.body.state || null;
    const taxRuleType = req.body.tax_rule_type || 'exempt';
    const gstRate = req.body.gst_rate || 0.00;
    const destinationAmount = req.body.destination_amount !== undefined && req.body.destination_amount !== ''
        ? req.body.destination_amount
        : (req.body.gst_amount || 0.00);
    const is_trending = req.body.is_trending === 'true' || req.body.is_trending === true || req.body.is_trending === 'on';
    const allowedVisaCategories = ['visa_free_on_arrival', 'e_visa', 'stamped_visa'];
    const requestedVisaCategory = String(req.body.visa_category || '').trim();
    const visa_category = allowedVisaCategories.includes(requestedVisaCategory) ? requestedVisaCategory : null;
    const is_visa_free = visa_category === 'visa_free_on_arrival';
    const is_customizable = req.body.is_customizable === 'true' || req.body.is_customizable === true || req.body.is_customizable === 'on' || req.body.customize === 'true' || req.body.customize === true || req.body.customize === 'on';
    const customize = is_customizable;

    let feature_image = req.body.existing_feature_image || null;
    if (req.file) {
        feature_image = `/uploads/destinations/${req.file.filename}`;
    }

    let tags = req.body['tags[]'] || req.body.tags || [];
    if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
        // already array
    } else {
        tags = [];
    }

    try {
        const transaction = await db.transaction();
        try {
            let dest;
            // Use the admin-provided slug when present. A blank slug falls back to
            // the destination name, while the uniqueness helper also covers
            // existing and soft-deleted destinations.
            const slug = await ensureUniqueDestinationSlug(requestedSlug || cleanName, id || null, transaction);

            let activities = [];
            if (req.body.activities_data) {
                try {
                    activities = JSON.parse(req.body.activities_data);
                } catch (e) {
                    console.error("Error parsing activities_data:", e);
                }
            }

            const updateData = { name: cleanName, title, type, slug, meta_title, meta_description, meta_keyword, schema, is_trending, is_visa_free, visa_category, customize, is_customizable, feature_image, feature_image_alt, country, state, tax_rule_type: taxRuleType, gst_rate: gstRate, tcs_rate: 0.00, gst_amount: destinationAmount || 0.00, tags, activities_data: activities };
            if (id) {
                dest = await Destination.findByPk(id, { transaction });
                if (!dest) {
                    const notFoundError = new Error('Destination not found.');
                    notFoundError.statusCode = 404;
                    throw notFoundError;
                }
                await dest.update(updateData, { transaction });
                await DestinationCategory.destroy({ where: { destination_id: id }, transaction });
            } else {
                dest = await Destination.create(updateData, { transaction });
            }
            if (categories && categories.length) {
                await DestinationCategory.bulkCreate(categories.map(cId => ({ destination_id: dest.id, category_id: cId })), { transaction });
            }

            if (req.body.crowd_levels) {
                let crowdData = {};
                try { crowdData = JSON.parse(req.body.crowd_levels); } catch(e){}

                await DestinationCrowdLevel.destroy({ where: { destination_id: dest.id }, transaction });

                const newLevels = [];
                for (const date in crowdData) {
                    newLevels.push({ destination_id: dest.id, date, level: crowdData[date] });
                }
                if (newLevels.length) {
                    await DestinationCrowdLevel.bulkCreate(newLevels, { transaction });
                }
            }



            await transaction.commit();
            res.json({ success: true, id: dest.id });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Destination save failed:', err);
        if (err && err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'A destination with the same URL slug already exists. Please try a different name.'
            });
        }
        if (err && err.name === 'SequelizeValidationError') {
            const details = Array.isArray(err.errors)
                ? err.errors.map(item => item.message).filter(Boolean).join(', ')
                : '';
            return res.status(400).json({
                success: false,
                message: details || 'Please check the destination details and try again.'
            });
        }
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.statusCode ? err.message : 'Unable to save destination. Please try again.'
        });
    }
});

router.delete('/destinations/:id', async (req, res) => {
    try {
        await Destination.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/destinations/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await Destination.destroy({ where: { id: ids } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Destination Gallery Routes
router.get('/destinations/:id/gallery', async (req, res) => {
    try {
        const destination = await Destination.findByPk(req.params.id, {
            include: [{ model: Media, as: 'gallery' }]
        });
        if (!destination) return res.status(404).send('Destination not found');
        res.render('travel/destinations/gallery', { title: `Gallery: ${destination.name}`, destination });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/destinations/:id/gallery', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const isVideo = req.file.mimetype.startsWith('video/');
        const media = await Media.create({
            entity_type: 'destination',
            entity_id: req.params.id,
            url: `/uploads/destinations/${req.file.filename}`,
            media_type: isVideo ? 'video' : 'image'
        });

        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/destinations/:id/gallery/:mediaId', async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.mediaId);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        // Delete from filesystem
        const filePath = path.join(__dirname, '..', '..', 'public', media.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await media.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/api/v1/media/:id', async (req, res) => {
    try {
        const { key, label, poster_url, alt_text, is_primary } = req.body;
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        const updateData = {};
        if (key !== undefined) updateData.key = key;
        if (label !== undefined) updateData.label = label;
        if (poster_url !== undefined) updateData.poster_url = poster_url;
        if (alt_text !== undefined) updateData.alt_text = alt_text;
        if (is_primary !== undefined) updateData.is_primary = is_primary;

        await media.update(updateData);
        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/media/:id/poster', upload.single('poster'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        const posterUrl = `/uploads/destinations/${req.file.filename}`;
        await media.update({ poster_url: posterUrl });

        res.json({ success: true, poster_url: posterUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});




// ─────────────────────────────────────────────
// CATEGORIES MASTER
// ─────────────────────────────────────────────
router.get('/categories', async (req, res) => {
    try {
        const categories = await categoryRepo.findAll();
        res.render('travel/categories/index', { title: 'Destination Categories', categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ─────────────────────────────────────────────
// PACKAGE CATEGORIES MASTER
// ─────────────────────────────────────────────
router.get('/package-categories', async (req, res) => {
    try {
        const packageCategories = await packageCategoryRepo.findAll();
        const categories = await categoryRepo.findAll();
        res.render('travel/package-categories/index', { title: 'Package Categories', packageCategories, categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/categories/create', async (req, res) => {
    res.render('travel/categories/form', { title: 'Create Category', category: null });
});

router.get('/categories/:id/edit', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        res.render('travel/categories/form', { title: 'Edit Category', category });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/categories/save', async (req, res) => {
    const { id, name } = req.body;
    try {
        if (id) await Category.update({ name }, { where: { id } });
        else await Category.create({ name });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ─────────────────────────────────────────────
// DESTINATION MAPPING
// ─────────────────────────────────────────────
router.get('/mappings', async (req, res) => {
    try {
        const mappings = await DestinationMapping.findAll({
            include: [
                { model: Destination, as: 'destination' },
                {
                    model: City, as: 'city',
                    include: [{ model: Country, as: 'country', include: [{ model: Continent, as: 'continent' }] }]
                }
            ]
        });
        const destinations = await Destination.findAll();
        const continents = await continentRepo.findAll();
        const countries = await Country.findAll({ include: [{ model: Continent, as: 'continent' }] });
        res.render('travel/mappings/index', { title: 'Destination Mapping', mappings, destinations, continents, countries, cities: [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/mappings', async (req, res) => {
    const { _id, destination_id, city_id } = req.body;
    try {
        if (_id) {
            await DestinationMapping.update({ destination_id, city_id }, { where: { id: _id } });
        } else {
            await DestinationMapping.create({ destination_id, city_id });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/mappings/:id', async (req, res) => {
    try {
        await DestinationMapping.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// PACKAGES MODULE
// ─────────────────────────────────────────────
router.get('/packages', async (req, res) => {
    try {
        const result = await packageRepo.findAll({ page: 1, limit: 1000 });
        const packages = result.rows ?? result;

        // return res.json(packages);
        res.render('travel/packages/index', { title: 'Packages', packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/packages/reorder', async (req, res) => {
    const ids = Array.isArray(req.body.ids)
        ? [...new Set(req.body.ids.map(Number).filter(Number.isInteger))]
        : [];

    if (!ids.length) {
        return res.status(400).json({ success: false, message: 'Package order is required.' });
    }

    const transaction = await db.transaction();
    try {
        const packageCount = await Package.count({ where: { id: ids }, transaction });
        if (packageCount !== ids.length) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'One or more packages are invalid.' });
        }

        for (let index = 0; index < ids.length; index++) {
            await Package.update(
                { sort_order: index + 1 },
                { where: { id: ids[index] }, transaction }
            );
        }

        await transaction.commit();
        res.json({ success: true, message: 'Package order updated successfully.' });
    } catch (err) {
        await transaction.rollback();
        console.error('Package reorder failed:', err);
        res.status(500).json({ success: false, message: 'Unable to update package order.' });
    }
});

router.post('/packages/:id/duplicate', async (req, res) => {
    try {
        const source = await Package.findByPk(req.params.id, {
            include: [
                { model: PackageDestination, as: 'destinations' },
                { model: PackageInclusion, as: 'inclusions' },
                { model: PackageExclusion, as: 'exclusions' },
                { model: PackageHighlight, as: 'highlights' },
                { model: Media, as: 'gallery' },
                { model: PackageCategory, as: 'package_categories' }
            ]
        });
        if (!source) return res.status(404).json({ success: false, message: 'Package not found.' });

        const transaction = await db.transaction();
        try {
            const baseName = `${source.name} Copy`;
            let duplicateName = baseName;
            let nameSuffix = 2;
            while (await Package.count({ where: { name: duplicateName }, transaction })) {
                duplicateName = `${baseName} ${nameSuffix++}`;
            }

            const baseSlug = `${source.slug || source.name || 'package'}-copy`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            let duplicateSlug = baseSlug;
            let slugSuffix = 2;
            while (await Package.count({ where: { slug: duplicateSlug }, transaction })) {
                duplicateSlug = `${baseSlug}-${slugSuffix++}`;
            }

            const maxSortOrder = parseInt(await Package.max('sort_order', { transaction }), 10) || 0;
            const duplicate = await Package.create({
                name: duplicateName,
                slug: duplicateSlug,
                sort_order: maxSortOrder + 1,
                travel_type: source.travel_type,
                duration_days: source.duration_days,
                departure_city: source.departure_city,
                price: source.price,
                discount_percentage: source.discount_percentage,
                tax_type: source.tax_type,
                tax_percent: source.tax_percent,
                status: source.status,
                show_in_home_page: false,
                is_customizable: source.is_customizable,
                description: source.description,
                meta_title: source.meta_title,
                meta_description: source.meta_description,
                meta_keyword: source.meta_keyword,
                schema: source.schema,
                vendor_id: source.vendor_id,
                main_image: source.main_image,
                main_image_alt: source.main_image_alt
            }, { transaction });

            if (source.destinations?.length) {
                await PackageDestination.bulkCreate(source.destinations.map(item => ({
                    package_id: duplicate.id,
                    destination_id: item.destination_id,
                    nights: item.nights,
                    activities: item.activities,
                    order: item.order
                })), { transaction });
            }
            if (source.inclusions?.length) {
                await PackageInclusion.bulkCreate(source.inclusions.map(item => ({
                    package_id: duplicate.id,
                    text: item.text,
                    icon: item.icon
                })), { transaction });
            }
            if (source.exclusions?.length) {
                await PackageExclusion.bulkCreate(source.exclusions.map(item => ({
                    package_id: duplicate.id,
                    text: item.text,
                    icon: item.icon
                })), { transaction });
            }
            if (source.highlights?.length) {
                await PackageHighlight.bulkCreate(source.highlights.map((item, index) => ({
                    package_id: duplicate.id,
                    content: item.content,
                    sort_order: Number(item.sort_order || index + 1)
                })), { transaction });
            }
            if (source.package_categories?.length) {
                await PackageCategoryMapping.bulkCreate(source.package_categories.map(item => ({
                    package_id: duplicate.id,
                    package_category_id: item.id
                })), { transaction });
            }
            if (source.gallery?.length) {
                await Media.bulkCreate(source.gallery.map(item => ({
                    entity_type: 'package',
                    entity_id: duplicate.id,
                    url: item.url,
                    alt_text: item.alt_text,
                    media_type: item.media_type,
                    key: item.key,
                    label: item.label,
                    poster_url: item.poster_url,
                    is_primary: item.is_primary
                })), { transaction });
            }

            await transaction.commit();
            res.status(201).json({
                success: true,
                message: 'Package duplicated successfully.',
                id: duplicate.id
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Package duplicate failed:', err);
        res.status(500).json({ success: false, message: 'Unable to duplicate package.' });
    }
});

router.get('/packages/hotel-options', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
        const selectedId = parseInt(req.query.selected_id, 10);
        const attributes = ['id', 'destination_id', 'city_id', 'name', 'image_url', 'star_rating', 'guest_rating', 'price_per_night'];
        const { count, rows } = await Hotel.findAndCountAll({
            attributes,
            order: [['name', 'ASC'], ['id', 'ASC']],
            limit,
            offset: (page - 1) * limit
        });
        const hotels = rows.map(hotel => hotel.get({ plain: true }));

        if (page === 1 && Number.isInteger(selectedId) && !hotels.some(hotel => hotel.id === selectedId)) {
            const selectedHotel = await Hotel.findByPk(selectedId, { attributes });
            if (selectedHotel) hotels.unshift(selectedHotel.get({ plain: true }));
        }

        res.json({
            success: true,
            hotels,
            pagination: {
                page,
                limit,
                total: count,
                hasMore: page * limit < count
            }
        });
    } catch (err) {
        console.error('Hotel options error:', err);
        res.status(500).json({ success: false, message: 'Unable to load hotels.' });
    }
});

router.get('/packages/create', async (req, res) => {
    try {

        const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
        const categories = await categoryRepo.findAll();
        const packageCategories = await PackageCategory.findAll({ order: [['title', 'ASC']] });
        const activities = await Activity.findAll({ order: [['name', 'ASC']] });
        const taxTypes = await getTaxTypes();
        res.render('travel/packages/create', {
            title: 'Create Package',
            pkg: null,
            destinations,
            categories,
            packageCategories,
            activities,
            taxTypes
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.get('/packages/:id/edit', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id, {
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    include: [{ model: Destination, as: 'destination' }]
                },
                { model: PackageInclusion, as: 'inclusions' },
                { model: PackageExclusion, as: 'exclusions' },
                { model: PackageHighlight, as: 'highlights' },
                { model: Media, as: 'gallery' },
                { model: PackageCategory, as: 'package_categories' }
            ],
            order: [[{ model: PackageDestination, as: 'destinations' }, 'order', 'ASC']]
        });

        if (!pkg) return res.status(404).send('Package not found');

        const plainPkg = pkg.get({ plain: true });

        // Transform for frontend form (simplified for JSON)
        plainPkg.stays = plainPkg.destinations.map(pd => {
            const activities = pd.activities || {};
            return {
                id: pd.destination.id,
                name: pd.destination.name,
                nights: pd.nights,
                activities: withoutPackageHotels(activities),
                hotels: getPackageHotelsFromActivities(activities)
            };
        });

        const destinations = await Destination.findAll({ order: [['name', 'ASC']] });
        const activities = await Activity.findAll({ order: [['name', 'ASC']] });
        const packageCategories = await PackageCategory.findAll({ order: [['title', 'ASC']] });
        const taxTypes = await getTaxTypes();

        res.render('travel/packages/edit', {
            title: `Edit: ${plainPkg.name}`,
            pkg: plainPkg,
            destinations: destinations,
            activities: activities,
            packageCategories,
            taxTypes
        });

    } catch (err) {
        console.error('Edit error:', err);
        res.status(500).send(err.message);
    }
});

router.get('/packages/:id/reviews', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id, {
            attributes: ['id', 'name', 'slug', 'main_image', 'main_image_alt', 'price', 'duration_days']
        });
        if (!pkg) return res.status(404).send('Package not found');

        const result = await reviewRepo.findForTarget('package', req.params.id, { status: 'all' });
        const summary = await reviewRepo.summaryForTarget('package', req.params.id);
        const reviews = result.rows.map(row => row.get({ plain: true }));

        res.render('travel/packages/reviews', {
            title: `Package Reviews: ${pkg.name}`,
            pkg: pkg.get({ plain: true }),
            reviews,
            summary
        });
    } catch (err) {
        console.error('Package reviews error:', err);
        res.status(500).send(err.message);
    }
});

router.post('/packages/:id/reviews/save', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

        const rating = parseInt(req.body.rating, 10);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const status = ['pending', 'approved', 'rejected'].includes(req.body.status)
            ? req.body.status
            : 'approved';

        await Review.create({
            reviewable_type: 'package',
            reviewable_id: pkg.id,
            package_id: pkg.id,
            custom_trip_id: null,
            customer_id: null,
            rating,
            title: req.body.title || null,
            comment: req.body.comment || null,
            reviewer_name: req.body.reviewer_name || null,
            reviewer_email: req.body.reviewer_email || null,
            reviewer_phone: req.body.reviewer_phone || null,
            status,
            source: 'admin',
            metadata: {
                package_slug: pkg.slug,
                package_name: pkg.name
            }
        });

        res.json({ success: true, message: 'Package review added successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/packages/:packageId/reviews/:reviewId', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        const packageId = parseInt(req.params.packageId, 10);
        if (review.reviewable_type !== 'package' || (review.package_id !== packageId && review.reviewable_id !== packageId)) {
            return res.status(404).json({ success: false, message: 'Review not found for this package' });
        }

        const rating = parseInt(req.body.rating, 10);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const status = ['pending', 'approved', 'rejected'].includes(req.body.status)
            ? req.body.status
            : review.status;

        const textOrNull = value => {
            if (value === undefined || value === null) return null;
            const text = String(value).trim();
            return text || null;
        };

        await review.update({
            rating,
            title: textOrNull(req.body.title),
            comment: textOrNull(req.body.comment),
            reviewer_name: textOrNull(req.body.reviewer_name),
            reviewer_email: textOrNull(req.body.reviewer_email),
            reviewer_phone: textOrNull(req.body.reviewer_phone),
            status
        });

        res.json({ success: true, message: 'Package review updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/packages/:packageId/reviews/:reviewId', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        const packageId = parseInt(req.params.packageId, 10);
        if (review.reviewable_type !== 'package' || (review.package_id !== packageId && review.reviewable_id !== packageId)) {
            return res.status(404).json({ success: false, message: 'Review not found for this package' });
        }

        await review.destroy();
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/packages/:id', async (req, res) => {
    try {
        const pkg = await Package.findByPk(req.params.id, {
            include: [
                {
                    model: PackageDestination,
                    as: 'destinations',
                    include: [
                        { model: Destination, as: 'destination' }
                    ]
                },
                { model: PackageInclusion, as: 'inclusions' },
                { model: PackageExclusion, as: 'exclusions' },
                { model: PackageHighlight, as: 'highlights' },
                { model: Media, as: 'gallery' }
            ],
            order: [
                [{ model: PackageDestination, as: 'destinations' }, 'order', 'ASC']
            ]
        });

        if (!pkg) return res.status(404).send('Package not found');

        const plainPkg = pkg.get({ plain: true });
        let packageDay = 1;
        plainPkg.destinations = (plainPkg.destinations || []).map(pd => {
            const totalDays = Math.max(parseInt(pd.nights, 10) || 1, 1);
            const activitiesByDay = pd.activities || {};
            const hotels = getPackageHotelsFromActivities(activitiesByDay);
            const days = [];

            for (let dayOffset = 1; dayOffset <= totalDays; dayOffset++) {
                const dayActivities = activitiesByDay[dayOffset] || activitiesByDay[String(dayOffset)] || [];
                days.push({
                    day_number: packageDay++,
                    hotels: hotels.filter(hotel => Number(hotel.dayNumber || 1) === dayOffset),
                    activities: Array.isArray(dayActivities) ? dayActivities : []
                });
            }

            return {
                ...pd,
                hotels,
                days
            };
        });

        res.render('travel/packages/detail', {
            title: `Package: ${plainPkg.name}`,
            pkg: plainPkg
        });

    } catch (err) {
        console.error('DETAIL VIEW ERROR:', err);
        res.status(500).send('Something broke! | ' + err.message);
    }
});

// Gallery Management Routes
router.post('/packages/:id/gallery', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const isVideo = req.file.mimetype.startsWith('video/');
        const media = await Media.create({
            entity_type: 'package',
            entity_id: req.params.id,
            url: `/uploads/packages/${req.file.filename}`,
            media_type: isVideo ? 'video' : 'image'
        });

        res.json({ success: true, media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/packages/:id/gallery/:mediaId', async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.mediaId);
        if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

        // Delete from filesystem
        const filePath = path.join(__dirname, '..', '..', 'public', media.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await media.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/main-image', handleUpload(upload.single('main_image')), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const imageUrl = `/uploads/packages/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/:id/main-image', upload.single('main_image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const pkg = await Package.findByPk(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

        const imageUrl = `/uploads/packages/${req.file.filename}`;
        await pkg.update({ main_image: imageUrl });

        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/activity-image', handleUpload(upload.single('activity_image')), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const imageUrl = `/uploads/packages/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/packages/save', async (req, res) => {
    const { id, name, duration, departure_city, price, description, show_in_home_page, main_image, main_image_alt, destinations, inclusions, exclusions, highlights, package_categories, meta_title, meta_description, meta_keyword, schema } = req.body;
    const normalizedHighlights = normalizePackageHighlights(highlights);
    const is_customizable = req.body.is_customizable === true || req.body.is_customizable === 'true' || req.body.is_customizable === 'on' || req.body.is_customizable === 1 || req.body.is_customizable === '1';
    const slug = (req.body.slug || name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const requestedSortOrder = parseInt(req.body.sort_order, 10);
    const requestedTravelType = String(req.body.travel_type || '').trim().toLowerCase();
    const travelType = ['domestic', 'international'].includes(requestedTravelType)
        ? requestedTravelType
        : 'domestic';
    const textOrNull = value => {
        if (value === undefined || value === null || value === '') return null;
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
    };

    try {
        const selectedTaxType = String(req.body.tax_type || '').trim().slice(0, 100);
        const taxTypes = await getTaxTypes();
        const selectedTaxConfig = taxTypes.find(t => t.name.toLowerCase() === selectedTaxType.toLowerCase());
        const taxPercent = selectedTaxType
            ? clampPercent(req.body.tax_percent !== undefined ? req.body.tax_percent : selectedTaxConfig?.percent)
            : 0;
        const discountPercentage = clampPercent(req.body.discount_percentage);
        const transaction = await db.transaction();

        try {
            let pkg;
            if (id) {
                // Update existing package
                pkg = await Package.findByPk(id);
                if (!pkg) throw new Error('Package not found');
                await pkg.update({
                    name,
                    slug,
                    sort_order: Number.isInteger(requestedSortOrder) && requestedSortOrder >= 0 ? requestedSortOrder : pkg.sort_order,
                    travel_type: travelType,
                    duration_days: duration,
                    departure_city: String(departure_city || '').trim().slice(0, 150) || null,
                    price: price || 0,
                    discount_percentage: discountPercentage,
                    tax_type: selectedTaxType || null,
                    tax_percent: taxPercent,
                    description: description || '',
                    meta_title: textOrNull(meta_title),
                    meta_description: textOrNull(meta_description),
                    meta_keyword: textOrNull(meta_keyword),
                    schema: textOrNull(schema),
                    main_image: main_image || null,
                    main_image_alt: main_image_alt || null,
                    show_in_home_page: show_in_home_page || false,
                    is_customizable
                }, { transaction });

                // Delete existing related data to recreate
                await PackageDestination.destroy({ where: { package_id: id }, transaction });
                await PackageInclusion.destroy({ where: { package_id: id }, transaction });
                await PackageExclusion.destroy({ where: { package_id: id }, transaction });
                await PackageHighlight.destroy({ where: { package_id: id }, transaction });
                await PackageCategoryMapping.destroy({ where: { package_id: id }, transaction });
            } else {
                // Create new Package
                const maxSortOrder = parseInt(await Package.max('sort_order', { transaction }), 10) || 0;
                pkg = await Package.create({
                    name,
                    slug,
                    sort_order: Number.isInteger(requestedSortOrder) && requestedSortOrder >= 0 ? requestedSortOrder : maxSortOrder + 1,
                    travel_type: travelType,
                    duration_days: duration,
                    departure_city: String(departure_city || '').trim().slice(0, 150) || null,
                    price: price || 0,
                    discount_percentage: discountPercentage,
                    tax_type: selectedTaxType || null,
                    tax_percent: taxPercent,
                    description: description || '',
                    meta_title: textOrNull(meta_title),
                    meta_description: textOrNull(meta_description),
                    meta_keyword: textOrNull(meta_keyword),
                    schema: textOrNull(schema),
                    main_image: main_image || null,
                    main_image_alt: main_image_alt || null,
                    show_in_home_page: show_in_home_page || false,
                    is_customizable
                }, { transaction });
            }

            // 2. Save Destinations with JSON activities
            if (destinations && destinations.length) {
                for (let i = 0; i < destinations.length; i++) {
                    const dest = destinations[i];
                    await PackageDestination.create({
                        package_id: pkg.id,
                        destination_id: dest.destinationId,
                        nights: dest.nights,
                        order: i + 1,
                        activities: withPackageHotels(dest.activities || {}, dest.hotels || [])
                    }, { transaction });
                }
            }

            // 3. Inclusions
            if (inclusions?.length) {
                await PackageInclusion.bulkCreate(
                    inclusions.map(text => ({ package_id: pkg.id, text })),
                    { transaction }
                );
            }

            // 4. Exclusions
            if (exclusions?.length) {
                await PackageExclusion.bulkCreate(
                    exclusions.map(text => ({ package_id: pkg.id, text })),
                    { transaction }
                );
            }

            // 5. Highlights (request payload is an array; rows preserve its order)
            if (normalizedHighlights.length) {
                await PackageHighlight.bulkCreate(
                    normalizedHighlights.map((content, index) => ({ package_id: pkg.id, content, sort_order: index + 1 })),
                    { transaction }
                );
            }

            // 6. Package Categories
            if (package_categories && Array.isArray(package_categories) && package_categories.length) {
                await PackageCategoryMapping.bulkCreate(
                    package_categories.map(catId => ({ package_id: pkg.id, package_category_id: parseInt(catId) })),
                    { transaction }
                );
            }

            await transaction.commit();
            res.json({
                success: true,
                message: id ? 'Package updated successfully!' : 'Package created successfully!',
                id: pkg.id
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// VIDEO REVIEWS
// ─────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await videoReviewRepo.findAll();
        res.render('travel/reviews/index', { title: 'Video Reviews', reviews });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/reviews/create', async (req, res) => {
    try {
        const packages = await packageRepo.findAll();
        res.render('travel/reviews/form', { title: 'Create Video Review', review: null, packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/reviews/:id/edit', async (req, res) => {
    try {
        const review = await videoReviewRepo.findById(req.params.id);
        if (!review) return res.status(404).send('Review not found');
        const packages = await packageRepo.findAll();
        res.render('travel/reviews/form', { title: `Edit Review`, review, packages });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/reviews/save', handleUpload(upload.fields([{ name: 'video_file', maxCount: 1 }, { name: 'avatar_file', maxCount: 1 }])), async (req, res) => {
    try {
        const { id, title, description, user_name, user_handle, location, likes_count, package_id, status } = req.body;
        
        let video_url = req.body.existing_video_url || null;
        let user_avatar = req.body.existing_avatar_url || null;
        
        if (req.files && req.files['video_file']) {
            video_url = `/uploads/reviews/${req.files['video_file'][0].filename}`;
        }
        if (req.files && req.files['avatar_file']) {
            user_avatar = `/uploads/reviews/${req.files['avatar_file'][0].filename}`;
        }

        const data = {
            title, description, user_name, user_handle, location,
            likes_count: parseInt(likes_count) || 0,
            package_id: package_id || null,
            status: status === 'on' || status === true || status === 'true',
            video_url,
            user_avatar
        };

        if (id) {
            await videoReviewRepo.update(id, data);
        } else {
            await videoReviewRepo.create(data);
        }
        
        res.json({ success: true, message: 'Review saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/api/v1/reviews/:id', async (req, res) => {
    try {
        await videoReviewRepo.delete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────
router.get('/api/v1/cities/paginated', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const result = await cityRepo.findPaginated(page, limit, search, req.query.continentId || '', req.query.countryId || '');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/destinations/:id/details', async (req, res) => {
    try {
        const mapping = await DestinationMapping.findOne({ where: { destination_id: req.params.id } });
        if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });
        const cityMappings = await DestinationMapping.findAll({
            where: { city_id: mapping.city_id },
            include: [{ model: Destination, as: 'destination' }]
        });
        const spots = cityMappings.map(m => m.destination).filter(Boolean);
        res.json({ city_id: mapping.city_id, spots });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/activities/by-destination/:destId', async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { destination_id: req.params.destId },
            order: [['name', 'ASC']]
        });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/api/v1/reviews', async (req, res) => {
    try {
        const data = await videoReviewRepo.findActive();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/api/v1/reviews/:id/like', async (req, res) => {
    try {
        const review = await videoReviewRepo.incrementLikes(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.json({ success: true, likes_count: review.likes_count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// HOTELS (Admin Master)
// ─────────────────────────────────────────────

// Hotel index — pass source mode to view
router.get('/hotels', async (req, res) => {
    const hotelSourceMode = await appSettingRepo.get('hotel_source_mode') || 'manual';
    const hotelApiKey    = await appSettingRepo.get('hotel_api_key') || '';
    const hotelApiProvider = await appSettingRepo.get('hotel_api_provider') || '';
    // inject into request so controller can pass to view
    req._hotelSourceMode = hotelSourceMode;
    req._hotelApiKey = hotelApiKey;
    req._hotelApiProvider = hotelApiProvider;
    return travelHotelController.index(req, res);
});

// Block manual create when 3rd party mode is on
router.get('/hotels/create', async (req, res) => {
    const mode = await appSettingRepo.get('hotel_source_mode') || 'manual';
    if (mode === 'third_party') {
        return res.redirect('/travel/hotels?blocked=1');
    }
    return travelHotelController.create(req, res);
});

router.post('/hotels/save', handleUpload(upload.fields([{ name: 'gallery_files', maxCount: 20 }])), async (req, res) => {
    const mode = await appSettingRepo.get('hotel_source_mode') || 'manual';
    if (mode === 'third_party') {
        return res.status(403).json({ success: false, message: '3rd party API mode is active. Manual hotel creation is disabled.' });
    }
    return travelHotelController.store(req, res);
});

// Save hotel source settings
router.post('/hotels/settings/save', async (req, res) => {
    try {
        const { hotel_source_mode, hotel_api_key, hotel_api_provider } = req.body;
        await appSettingRepo.set('hotel_source_mode', hotel_source_mode || 'manual');
        await appSettingRepo.set('hotel_api_key', hotel_api_key || '');
        await appSettingRepo.set('hotel_api_provider', hotel_api_provider || '');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/hotels/:id/edit', async (req, res) => {
    const mode = await appSettingRepo.get('hotel_source_mode') || 'manual';
    if (mode === 'third_party') return res.redirect('/travel/hotels?blocked=1');
    return travelHotelController.edit(req, res);
});
router.post('/hotels/:id', handleUpload(upload.fields([{ name: 'gallery_files', maxCount: 20 }])), (req, res) => travelHotelController.update(req, res));
router.delete('/hotels/bulk', async (req, res) => {
    const mode = await appSettingRepo.get('hotel_source_mode') || 'manual';
    if (mode === 'third_party') {
        return res.status(403).json({ success: false, message: 'Bulk deletion is disabled while 3rd Party API mode is active.' });
    }
    return travelHotelController.bulkDestroy(req, res);
});
router.delete('/hotels/:id', (req, res) => travelHotelController.destroy(req, res));

// ─────────────────────────────────────────────
// ACTIVITIES (Admin Master)
// ─────────────────────────────────────────────
router.get('/activities', (req, res) => travelActivityController.index(req, res));
router.get('/activities/create', (req, res) => travelActivityController.create(req, res));
router.post('/activities/save', (req, res) => travelActivityController.store(req, res));
router.get('/activities/:id/edit', (req, res) => travelActivityController.edit(req, res));
router.post('/activities/:id', (req, res) => travelActivityController.update(req, res));
router.delete('/activities/:id', (req, res) => travelActivityController.destroy(req, res));

module.exports = router;
