const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { swaggerUi, specs } = require('./config/swagger');
const container = require('./container');
const { DEFAULT_THEME_COLOURS, buildThemeCssVariables, loadThemeColours } = require('./utils/themeColours');
const {
  repositories: { appSettingRepo, themeRepo },
  models: { PackageBooking, PackageReturnRequest, Package, User, Lead, Customer, VendorProfile, Country, ForexService, ForexConversionRate, ForexConversionRequest, Newsletter }
} = container;



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/api-docs', swaggerUi.serve, (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const dynamicSpecs = {
    ...specs,
    servers: [{ url: `${protocol}://${req.get('host')}` }]
  };
  swaggerUi.setup(dynamicSpecs)(req, res);
});
app.use('/swagger', swaggerUi.serve, (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const dynamicSpecs = {
    ...specs,
    servers: [{ url: `${protocol}://${req.get('host')}` }]
  };
  swaggerUi.setup(dynamicSpecs)(req, res);
});
app.use(express.static(path.join(__dirname, '..', 'public')));

// Import Public APIs
const apiTripBuilderRoutes = require('./routes/apiTripBuilderRoutes');
const apiBookingRoutes = require('./routes/apiBookingRoutes');
const apiBlogRoutes = require('./routes/apiBlogRoutes');
const tripInquiryRoutes = require('./routes/tripInquiryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// ----- USE ROUTES -----
// Public APIs
app.use('/api/v1/build', apiTripBuilderRoutes);
app.use('/api/v1/bookings', apiBookingRoutes);
app.use('/api/v1/blogs', apiBlogRoutes);
app.use('/api/v1/trip-inquiries', tripInquiryRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);

app.use(session({
  secret: 'travel_forex_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Global Variables for Views
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.title = 'Dashboard';
  try {
    res.locals.company_logo_url = await appSettingRepo.get('company_logo_url') || '';
    res.locals.company_name = await appSettingRepo.get('company_name') || '';
    res.locals.theme_colours = await loadThemeColours(appSettingRepo, themeRepo);
    res.locals.theme_css_variables = buildThemeCssVariables(res.locals.theme_colours);
    res.locals.theme_primary_color = res.locals.theme_colours.theme_brand_primary;

    // Notifications and Followups
    const Notification = require('./container').models.Notification;
    const LeadFollowUp = require('./container').models.LeadFollowUp;
    if (Notification) {
      res.locals.unreadNotificationCount = await Notification.count({ where: { is_read: false } });
      res.locals.recentNotifications = await Notification.findAll({ where: { is_read: false }, order: [['created_at', 'DESC']], limit: 5 });
    } else {
      res.locals.unreadNotificationCount = 0;
      res.locals.recentNotifications = [];
    }
    
    if (LeadFollowUp) {
      res.locals.pendingFollowUpCount = await LeadFollowUp.count({ 
        where: { 
          status: 'pending'
        } 
      });
    } else {
      res.locals.pendingFollowUpCount = 0;
    }
  } catch (err) {
    res.locals.company_logo_url = '';
    res.locals.company_name = '';
    res.locals.theme_colours = DEFAULT_THEME_COLOURS;
    res.locals.theme_css_variables = buildThemeCssVariables(DEFAULT_THEME_COLOURS);
    res.locals.theme_primary_color = DEFAULT_THEME_COLOURS.theme_brand_primary;
    res.locals.unreadNotificationCount = 0;
    res.locals.recentNotifications = [];
    res.locals.pendingFollowUpCount = 0;
  }
  next();
});

// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
};

const getDashboardData = async () => {
  const defaults = {
    totalUsers: 0,
    packageBookingCount: 0,
    packageBookingTotal: 0,
    packageBookingPaidTotal: 0,
    vendorPayableTotal: 0,
    vendorRequestCount: 0,
    packageCount: 0,
    leadCount: 0,
    forexServiceCount: 0,
    forexRateCount: 0,
    forexConversionRequestCount: 0,
    packageReturnRequestCount: 0,
    newsletterCount: 0,
    usdToInrRate: 0,
    averageBookingValue: 0
  };

  try {
    const [
      totalUsers,
      packageBookingCount,
      packageBookingTotal,
      packageBookingPaidTotal,
      vendorPayableTotal,
      vendorRequestCount,
      packageCount,
      leadCount,
      forexServiceCount,
      forexRateCount,
      usdToInrRateRow,
      forexConversionRequestCount,
      packageReturnRequestCount,
      newsletterCount,
      recentVendorRequests,
      recentPackageBookings,
      recentPackageReturnRequests,
      recentForexConversionRequests,
      recentNewsletters,
      leadPipelineData
    ] = await Promise.all([
      User ? User.count() : 0,
      PackageBooking ? PackageBooking.count() : 0,
      PackageBooking ? PackageBooking.sum('package_total') : 0,
      PackageBooking ? PackageBooking.sum('paid_amount') : 0,
      PackageBooking ? PackageBooking.sum('vendor_amount') : 0,
      VendorProfile ? VendorProfile.count({ where: { status: 'pending' } }).catch(() => 0) : 0,
      Package ? Package.count() : 0,
      Lead ? Lead.count() : 0,
      ForexService ? ForexService.count().catch(() => 0) : 0,
      ForexConversionRate ? ForexConversionRate.count().catch(() => 0) : 0,
      ForexConversionRate && Country ? ForexConversionRate.findOne({
        where: {
          code: 'USD',
          base_code: 'INR',
          is_active: true
        },
        include: [{
          model: Country,
          as: 'country',
          attributes: ['id', 'name'],
          where: { name: 'United States' },
          required: true
        }],
        order: [['updated_at', 'DESC']]
      }).catch(() => null) : null,
      ForexConversionRequest ? ForexConversionRequest.count().catch(() => 0) : 0,
      PackageReturnRequest ? PackageReturnRequest.count({ where: { status: 'pending' } }).catch(() => 0) : 0,
      Newsletter ? Newsletter.count().catch(() => 0) : 0,
      VendorProfile ? VendorProfile.findAll({
        include: User ? [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone_number', 'status']
        }] : [],
        where: { status: 'pending' },
        order: [['created_at', 'DESC']],
        limit: 6
      }).catch(() => []) : [],
      PackageBooking ? PackageBooking.findAll({
        order: [['created_at', 'DESC']],
        limit: 6
      }) : [],
      PackageReturnRequest ? PackageReturnRequest.findAll({
        where: { status: 'pending' },
        include: PackageBooking ? [{
          model: PackageBooking,
          as: 'booking',
          required: false,
          attributes: ['id', 'booking_reference', 'package_name', 'package_total', 'paid_amount', 'remaining_amount', 'payment_status']
        }] : [],
        order: [['created_at', 'DESC']],
        limit: 6
      }).catch(() => []) : [],
      ForexConversionRequest ? ForexConversionRequest.findAll({
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
        limit: 6
      }).catch(() => []) : [],
      Newsletter ? Newsletter.findAll({
        attributes: ['id', 'email', 'status', 'subscribed_at', 'created_at'],
        order: [['subscribed_at', 'DESC'], ['created_at', 'DESC']],
        limit: 6
      }).catch(() => []) : [],
      (async () => {
        try {
            const { Pipeline, PipelineStage, Lead } = require('./container').models;
            if (!Pipeline || !Lead) return [];
            const pipelines = await Pipeline.findAll({
                include: [{ model: PipelineStage, as: 'stages' }],
                order: [['id', 'ASC']]
            });
            const leadCounts = await Lead.findAll({
                attributes: ['pipeline_id', 'stage_id', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
                group: ['pipeline_id', 'stage_id'],
                raw: true
            });
            return pipelines.map(p => {
                const stagesList = (p.stages || []).sort((a,b) => a.order - b.order).map(s => {
                    const match = leadCounts.find(lc => lc.pipeline_id === p.id && lc.stage_id === s.id);
                    return { name: s.name, color: s.color, count: match ? parseInt(match.count) : 0 };
                });
                return { pipeline: p.name, stages: stagesList };
            });
        } catch (e) {
            return [];
        }
      })()
    ]);

    const total = Number(packageBookingTotal || 0);
    return {
      dashboardStats: {
        totalUsers,
        packageBookingCount,
        packageBookingTotal: total,
        packageBookingPaidTotal: Number(packageBookingPaidTotal || 0),
        vendorPayableTotal: Number(vendorPayableTotal || 0),
        vendorRequestCount,
        packageCount,
        leadCount,
        forexServiceCount,
        forexRateCount,
        forexConversionRequestCount,
        packageReturnRequestCount,
        newsletterCount,
        usdToInrRate: usdToInrRateRow ? Number(usdToInrRateRow.conversion_rate || 0) : 0,
        averageBookingValue: packageBookingCount > 0 ? total / packageBookingCount : 0
      },
      recentVendorRequests: recentVendorRequests.map(row => row.get ? row.get({ plain: true }) : row),
      recentPackageBookings: recentPackageBookings.map(row => row.get ? row.get({ plain: true }) : row),
      recentPackageReturnRequests: recentPackageReturnRequests.map(row => row.get ? row.get({ plain: true }) : row),
      recentForexConversionRequests: recentForexConversionRequests.map(row => row.get ? row.get({ plain: true }) : row),
      recentNewsletters: recentNewsletters.map(row => row.get ? row.get({ plain: true }) : row),
      leadPipelineData
    };
  } catch (error) {
    console.error('Dashboard booking data error:', error.message);
    return { dashboardStats: defaults, recentVendorRequests: [], recentPackageBookings: [], recentPackageReturnRequests: [], recentForexConversionRequests: [], recentNewsletters: [] };
  }
};

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const crmCustomerRoutes = require('./routes/crmCustomerRoutes');

const vendorRoutes = require('./routes/vendorRoutes');

app.use('/auth', authRoutes);
app.use('/vendor', vendorRoutes);
app.use('/users', isAuthenticated, userRoutes);
app.use('/roles', isAuthenticated, roleRoutes);
app.use('/modules', isAuthenticated, moduleRoutes);
app.use('/permissions', isAuthenticated, permissionRoutes);
app.use('/customers', isAuthenticated, crmCustomerRoutes);

// ===== Travel & Booking API Routes (Phase 1) =====
const continentRoutes = require('./routes/continentRoutes');
const countryRoutes = require('./routes/countryRoutes');
const cityRoutes = require('./routes/cityRoutes');
const forexServiceRoutes = require('./routes/forexServiceRoutes');
const forexRateRoutes = require('./routes/forexRateRoutes');
const locationRoutes = require('./routes/locationRoutes');
const airportRoutes = require('./routes/airportRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const cmsApiRoutes = require('./routes/cmsApiRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const packageRoutes = require('./routes/packageRoutes');
const tourRoutes = require('./routes/tourRoutes');
const activityRoutes = require('./routes/activityRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const videoReviewRoutes = require('./routes/videoReviewRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/v1/continents', continentRoutes);
app.use('/api/v1/countries', countryRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/forex-services', forexServiceRoutes);
app.use('/api/v1/forex-rates', forexRateRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/airports', airportRoutes);
// CMS API
app.use('/api/v1/pages', cmsApiRoutes);

// Travel & Booking API Routes (Phase 1)
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/categories', categoryRoutes);
const packageCategoryRoutes = require('./routes/packageCategoryRoutes');
app.use('/api/v1/package-categories', packageCategoryRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/reviews', videoReviewRoutes);
app.use('/api/v1/package-review', reviewRoutes);
app.use('/api/v1/custom-package-review', reviewRoutes);
app.use('/api/v1/property-reviews', reviewRoutes);

// ===== CRM API Routes (Public/Lead Capture) =====
const crmApiRoutes = require('./routes/crmApiRoutes');
app.use('/api/v1/crm', crmApiRoutes);

// ===== Customer API Routes =====
const apiCustomerRoutes = require('./routes/apiCustomerRoutes');
app.use('/api/v1/customers', apiCustomerRoutes);

// ===== Travel UI Web Routes (EJS Views) =====
const travelWebRoutes = require('./routes/travelWebRoutes');
app.use('/travel', isAuthenticated, travelWebRoutes);

// ===== CRM Web Routes =====
const crmWebRoutes = require('./routes/crmWebRoutes');
app.use('/crm', isAuthenticated, crmWebRoutes);

// ===== CMS Web Routes =====
const cmsRoutes = require('./routes/cmsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const newsletterWebRoutes = require('./routes/newsletterWebRoutes');
app.use('/cms', isAuthenticated, cmsRoutes);
app.use('/newsletter-subscribers', isAuthenticated, newsletterWebRoutes);
app.use('/page', publicRoutes);

const redirectTourLink = async (req, res) => {
  try {
    const rawSlug = String(req.params.slug || req.query.package || req.query.package_slug || req.query.slug || '').trim();
    const slug = rawSlug.toLowerCase().replace(/^\/+|\/+$/g, '').replace(/["']/g, '');

    if (slug) {
      const pkg = /^\d+$/.test(slug)
        ? await Package.findByPk(slug)
        : await Package.findOne({ where: { slug } });

      if (pkg) {
        return res.redirect(`/travel/packages/${pkg.id}`);
      }
    }

    if (req.query.destination) {
      return res.redirect(`/travel/packages?search=${encodeURIComponent(req.query.destination)}`);
    }

    return res.redirect('/travel/packages');
  } catch (error) {
    console.error('Tour link redirect error:', error);
    return res.redirect('/travel/packages');
  }
};

app.get('/tours', isAuthenticated, redirectTourLink);
app.get('/tours/:slug', isAuthenticated, redirectTourLink);

// ===== Accounting Web Routes =====
const accountingRoutes = require('./routes/accountingRoutes');
app.use('/accounting', isAuthenticated, accountingRoutes);

// ===== Admin Wallet Web Routes =====
const adminWalletRoutes = require('./routes/adminWalletRoutes');
app.use('/admin/wallets', isAuthenticated, adminWalletRoutes);

// ===== Admin Vendor Web Routes =====
const adminVendorRoutes = require('./routes/adminVendorRoutes');
app.use('/admin/vendors', isAuthenticated, adminVendorRoutes);

// ===== Admin Booking Web Routes =====
const adminBookingRoutes = require('./routes/adminBookingRoutes');
app.use('/admin/bookings', isAuthenticated, adminBookingRoutes);

app.get('/', isAuthenticated, async (req, res) => {
  const dashboardData = await getDashboardData();
  res.render('dashboard', { title: 'Travel & Forex Dashboard', ...dashboardData });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Ignore client-aborted requests (browser navigates away mid-upload etc)
  if (err.message === 'Request aborted' || req.aborted) {
    if (!res.headersSent) {
      return res.status(499).json({ success: false, message: 'Request was cancelled.' });
    }
    return;
  }

  console.error('[Server Error]', err.stack || err.message);

  if (res.headersSent) return next(err);

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
  res.status(500).send('Something went wrong. Please try again.');
});

module.exports = app;
