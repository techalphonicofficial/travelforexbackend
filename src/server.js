const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { swaggerUi, specs } = require('./config/swagger');



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
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.title = 'Dashboard';
  next();
});

// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
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
const destinationRoutes = require('./routes/destinationRoutes');
const cmsApiRoutes = require('./routes/cmsApiRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const packageRoutes = require('./routes/packageRoutes');
const activityRoutes = require('./routes/activityRoutes');

app.use('/api/v1/continents', continentRoutes);
app.use('/api/v1/countries', countryRoutes);
app.use('/api/v1/cities', cityRoutes);
// CMS API
app.use('/api/v1/pages', cmsApiRoutes);

// Travel & Booking API Routes (Phase 1)
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/activities', activityRoutes);

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
app.use('/cms', isAuthenticated, cmsRoutes);
app.use('/page', publicRoutes);

app.get('/', isAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Travel & Forex Dashboard' });
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
