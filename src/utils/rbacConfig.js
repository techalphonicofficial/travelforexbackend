const NAV_ITEMS = [
  {
    key: 'dashboard',
    module: 'Dashboard',
    permission: 'Dashboard',
    label: 'Dashboard',
    href: '/',
    icon: 'bi-grid-1x2',
    stripIcon: 'bi-grid-1x2-fill',
    active: title => title === 'Dashboard' || title === 'Travel & Forex Dashboard',
    routePrefixes: ['/']
  },
  {
    key: 'newsletter',
    module: 'Newsletter',
    permission: 'Newsletter',
    label: 'Newsletter',
    href: '/newsletter-subscribers',
    icon: 'bi-envelope-paper',
    stripIcon: 'bi-envelope-paper-fill',
    active: title => title === 'Newsletter Subscribers',
    routePrefixes: ['/newsletter-subscribers']
  },
  {
    key: 'access_control',
    module: 'Access Control',
    permission: 'Access Control',
    label: 'Access Control',
    href: '/users',
    icon: 'bi-shield-lock',
    stripIcon: 'bi-shield-lock-fill',
    active: title => title && (title.includes('User') || title.includes('Vendor Requests') || title.includes('Role') || title.includes('Module') || title.includes('Permission')),
    children: [
      { key: 'users', module: 'Access Control', permission: 'Users', label: 'Users', href: '/users', icon: 'bi-people', active: title => title === 'User Management', routePrefixes: ['/users', '/customers'] },
      { key: 'vendor_requests', module: 'Access Control', permission: 'Vendor Requests', label: 'Vendor Requests', href: '/admin/vendors/requests', icon: 'bi-shop', active: title => title === 'Vendor Requests', routePrefixes: ['/admin/vendors'] },
      { key: 'roles', module: 'Access Control', permission: 'Roles', label: 'Roles', href: '/roles', icon: 'bi-key', active: title => title && title.includes('Role'), routePrefixes: ['/roles'] },
      { key: 'modules', module: 'Access Control', permission: 'Modules', label: 'Modules', href: '/modules', icon: 'bi-box', active: title => title && title.includes('Module'), routePrefixes: ['/modules'] },
      { key: 'permissions', module: 'Access Control', permission: 'Permissions', label: 'Permissions', href: '/permissions', icon: 'bi-shield-check', active: title => title && title.includes('Permission'), routePrefixes: ['/permissions'] }
    ]
  },
  {
    key: 'travel',
    module: 'Travel',
    permission: 'Travel',
    label: 'Travel',
    href: '/travel/packages',
    icon: 'bi-airplane',
    stripIcon: 'bi-airplane-fill',
    active: title => title && (title.includes('Continent') || title.includes('Countr') || title.includes('Cit') || title.includes('Airport') || title.includes('Destination') || title.includes('Categor') || title.includes('Mapping') || title.includes('Package') || title.includes('Coupon') || title.includes('Review') || title.includes('Booking') || title.includes('Inquiry') || title.includes('Hotel')),
    children: [
      { key: 'continents', module: 'Travel', permission: 'Continents', label: 'Continents', href: '/travel/continents', icon: 'bi-globe2', active: title => title === 'Continents', routePrefixes: ['/travel/continents'] },
      { key: 'countries', module: 'Travel', permission: 'Countries', label: 'Countries', href: '/travel/countries', icon: 'bi-flag', active: title => title === 'Countries', routePrefixes: ['/travel/countries'] },
      { key: 'cities', module: 'Travel', permission: 'Cities', label: 'Cities', href: '/travel/cities', icon: 'bi-buildings', active: title => title === 'Cities', routePrefixes: ['/travel/cities'] },
      { key: 'airports', module: 'Travel', permission: 'Airports', label: 'Airports', href: '/travel/airports', icon: 'bi-airplane', active: title => title === 'Airports', routePrefixes: ['/travel/airports'] },
      { key: 'destination_categories', module: 'Travel', permission: 'Destination Categories', label: 'Categories', href: '/travel/categories', icon: 'bi-tags', active: title => title === 'Destination Categories', routePrefixes: ['/travel/categories'] },
      { key: 'package_categories', module: 'Travel', permission: 'Package Categories', label: 'Pkg Categories', href: '/travel/package-categories', icon: 'bi-box-seam', active: title => title === 'Package Categories', routePrefixes: ['/travel/package-categories'] },
      { key: 'destinations', module: 'Travel', permission: 'Destinations', label: 'Destinations', href: '/travel/destinations', icon: 'bi-geo-alt', active: title => title === 'Destinations' || title === 'Create Destination' || title === 'Edit Destination', routePrefixes: ['/travel/destinations'] },
      { key: 'mappings', module: 'Travel', permission: 'Destination Mapping', label: 'Mapping', href: '/travel/mappings', icon: 'bi-diagram-3', active: title => title === 'Destination Mapping', routePrefixes: ['/travel/mappings'] },
      { key: 'packages', module: 'Travel', permission: 'Packages', label: 'Packages', href: '/travel/packages', icon: 'bi-suitcase-lg', active: title => title && title.includes('Package') && title !== 'Package Bookings', routePrefixes: ['/travel/packages', '/tours'] },
      { key: 'coupons', module: 'Travel', permission: 'Coupons', label: 'Coupons', href: '/travel/coupons', icon: 'bi-ticket-perforated', active: title => title && title.includes('Coupon'), routePrefixes: ['/travel/coupons'] },
      { key: 'hotels', module: 'Travel', permission: 'Hotels', label: 'Hotels', href: '/travel/hotels', icon: 'bi-building', active: title => title && (title === 'Hotels' || title === 'Add Hotel' || title === 'Edit Hotel'), routePrefixes: ['/travel/hotels'] },
      { key: 'package_bookings', module: 'Travel', permission: 'Package Bookings', label: 'Package Bookings', href: '/admin/bookings/package-bookings', icon: 'bi-receipt-cutoff', active: title => title === 'Package Bookings', routePrefixes: ['/admin/bookings'] },
      { key: 'hotel_bookings', module: 'Travel', permission: 'Hotel Bookings', label: 'Hotel Bookings', href: '/admin/bookings/hotel-bookings', icon: 'bi-journal-check', active: title => title === 'Hotel Bookings', routePrefixes: ['/admin/bookings/hotel-bookings'] },
      { key: 'video_reviews', module: 'Travel', permission: 'Video Reviews', label: 'Video Reviews', href: '/travel/reviews', icon: 'bi-camera-reels', active: title => title && title.includes('Review'), routePrefixes: ['/travel/reviews'] }
    ]
  },
  {
    key: 'forex',
    module: 'Forex Services',
    permission: 'Forex Services',
    label: 'Forex Services',
    href: '/travel/forex-services',
    icon: 'bi-currency-exchange',
    stripIcon: 'bi-currency-exchange',
    active: title => title && title.includes('Forex'),
    children: [
      { key: 'forex_services', module: 'Forex Services', permission: 'Forex Services', label: 'Forex Services', href: '/travel/forex-services', icon: 'bi-currency-exchange', active: title => title === 'Forex Services', routePrefixes: ['/travel/forex-services'] },
      { key: 'forex_rates', module: 'Forex Services', permission: 'Forex Rates', label: 'Forex Rates', href: '/travel/forex-rates', icon: 'bi-cash-coin', active: title => title === 'Forex Conversion Rates', routePrefixes: ['/travel/forex-rates'] },
      { key: 'forex_converter', module: 'Forex Services', permission: 'Forex Converter', label: 'Forex Converter', href: '/travel/forex-converter', icon: 'bi-arrow-left-right', active: title => title === 'Forex Converter', routePrefixes: ['/travel/forex-converter'] },
      { key: 'forex_requests', module: 'Forex Services', permission: 'Forex Service Requests', label: 'Forex Service Requests', href: '/travel/forex-service-requests', icon: 'bi-receipt', active: title => title === 'Forex Service Requests', routePrefixes: ['/travel/forex-service-requests'] }
    ]
  },
  {
    key: 'crm',
    module: 'CRM',
    permission: 'CRM',
    label: 'CRM (Leads)',
    href: '/crm/leads',
    icon: 'bi-people',
    stripIcon: 'bi-people-fill',
    active: title => title && (title.includes('CRM') || title.includes('Lead') || title.includes('Pipeline') || title.includes('Follow-up')),
    children: [
      { key: 'leads', module: 'CRM', permission: 'Leads', label: 'Leads', href: '/crm/leads', icon: 'bi-person-lines-fill', active: title => title === 'CRM Leads' || (title && title.includes('Lead:')), routePrefixes: ['/crm/leads'] },
      { key: 'pipelines', module: 'CRM', permission: 'Pipelines', label: 'Pipelines', href: '/crm/pipelines', icon: 'bi-diagram-3', active: title => title === 'CRM Pipelines', routePrefixes: ['/crm/pipelines'] },
      { key: 'form_builder', module: 'CRM', permission: 'Form Builder', label: 'Form Builder', href: '/crm/form-builder', icon: 'bi-ui-checks', active: title => title === 'CRM Form Builder', routePrefixes: ['/crm/form-builder'] },
      { key: 'follow_ups', module: 'CRM', permission: 'Follow-ups', label: 'Follow-ups', href: '/crm/follow-ups', icon: 'bi-calendar-check', active: title => title === 'CRM Follow-ups', routePrefixes: ['/crm/follow-ups'] }
    ]
  },
  {
    key: 'pages',
    module: 'Pages',
    permission: 'Pages',
    label: 'Pages',
    href: '/cms/pages',
    icon: 'bi-file-earmark-richtext',
    stripIcon: 'bi-file-earmark-richtext-fill',
    active: title => title && (title.includes('Page') || title === 'Footer Settings'),
    children: [
      { key: 'all_pages', module: 'Pages', permission: 'All Pages', label: 'All Pages', href: '/cms/pages', icon: 'bi-file-earmark', active: title => title && title.includes('Page') && title !== 'Footer Settings', routePrefixes: ['/cms/pages'] },
      { key: 'footer_settings', module: 'Pages', permission: 'Footer Settings', label: 'Footer Settings', href: '/cms/footer', icon: 'bi-layout-text-window', active: title => title === 'Footer Settings', routePrefixes: ['/cms/footer'] }
    ]
  },
  {
    key: 'blogs',
    module: 'Blogs',
    permission: 'Blogs',
    label: 'Blogs',
    href: '/cms/blog/posts',
    icon: 'bi-journal-richtext',
    stripIcon: 'bi-journal-richtext',
    active: title => title && title.includes('Blog'),
    children: [
      { key: 'blog_posts', module: 'Blogs', permission: 'Blog Posts', label: 'All Posts', href: '/cms/blog/posts', icon: 'bi-pen', active: title => title && title.includes('Post'), routePrefixes: ['/cms/blog/posts'] },
      { key: 'blog_categories', module: 'Blogs', permission: 'Blog Categories', label: 'Categories', href: '/cms/blog/categories', icon: 'bi-tags', active: title => title && title.includes('Categories'), routePrefixes: ['/cms/blog/categories'] }
    ]
  },
  {
    key: 'accounting',
    module: 'Accounting',
    permission: 'Accounting',
    label: 'Accounting',
    href: '/accounting/dashboard',
    icon: 'bi-calculator',
    active: title => title && (title.includes('Accounting') || title.includes('Ledger') || title.includes('Trial') || title.includes('Profit') || title.includes('Journal') || title.includes('Voucher') || title.includes('Chart of') || title.includes('Wallet')),
    children: [
      { key: 'accounting_dashboard', module: 'Accounting', permission: 'Accounting Dashboard', label: 'Dashboard', href: '/accounting/dashboard', icon: 'bi-grid-1x2', active: title => title === 'Accounting Dashboard', routePrefixes: ['/accounting/dashboard'] },
      { key: 'vouchers', module: 'Accounting', permission: 'Vouchers', label: 'Vouchers', href: '/accounting/vouchers', icon: 'bi-receipt-cutoff', active: title => title === 'Accounting Vouchers' || (title && title.startsWith('Voucher ')), routePrefixes: ['/accounting/vouchers'] },
      { key: 'ledger', module: 'Accounting', permission: 'General Ledger', label: 'General Ledger', href: '/accounting/ledger', icon: 'bi-journal-text', active: title => title === 'General Ledger', routePrefixes: ['/accounting/ledger'] },
      { key: 'accounts', module: 'Accounting', permission: 'Chart of Accounts', label: 'Chart of Accounts', href: '/accounting/accounts', icon: 'bi-list-columns-reverse', active: title => title === 'Chart of Accounts', routePrefixes: ['/accounting/accounts'] },
      { key: 'trial_balance', module: 'Accounting', permission: 'Trial Balance', label: 'Trial Balance', href: '/accounting/trial-balance', icon: 'bi-scale', active: title => title === 'Trial Balance', routePrefixes: ['/accounting/trial-balance'] },
      { key: 'pnl', module: 'Accounting', permission: 'P&L Statement', label: 'P&L Statement', href: '/accounting/pnl', icon: 'bi-graph-up-arrow', active: title => title === 'Profit & Loss Statement', routePrefixes: ['/accounting/pnl'] },
      { key: 'new_voucher', module: 'Accounting', permission: 'New Voucher', label: 'New Voucher', href: '/accounting/vouchers/new', icon: 'bi-pencil-square', active: title => title === 'New Voucher', routePrefixes: ['/accounting/vouchers/new', '/accounting/journal'] },
      { key: 'wallet_requests', module: 'Accounting', permission: 'Wallet Requests', label: 'Wallet Requests', href: '/admin/wallets/requests', icon: 'bi-wallet2', active: title => title === 'Wallet Fund Requests', routePrefixes: ['/admin/wallets'] }
    ]
  },
  { key: 'reports', module: 'Reports', permission: 'Reports', label: 'Reports', href: '#', icon: 'bi-bar-chart', stripIcon: 'bi-bar-chart-fill', active: () => false, routePrefixes: [] },
  { key: 'crm_settings', module: 'CRM Settings', permission: 'CRM Settings', label: 'Crm Setting', href: '/crm/settings', icon: 'bi-gear', stripIcon: 'bi-gear-fill', active: title => title === 'CRM Settings', routePrefixes: ['/crm/settings'] }
];

const flattenNavItems = (items = NAV_ITEMS) => items.flatMap(item => [item, ...flattenNavItems(item.children || [])]);

const normalizePermission = value => String(value || '').trim().toLowerCase();

const isFullAccessUser = user => {
  const type = normalizePermission(user && user.type);
  const roleName = normalizePermission(user && user.role_name);
  return ['admin', 'super_admin'].includes(type) || ['system admin', 'admin', 'super admin'].includes(roleName);
};

const hasPermission = (user, permission) => {
  if (!permission) return true;
  if (isFullAccessUser(user)) return true;
  const permissions = Array.isArray(user && user.permissions) ? user.permissions : [];
  return permissions.map(normalizePermission).includes(normalizePermission(permission));
};

const canAccessItem = (user, item) => {
  if (!item) return false;
  if (isFullAccessUser(user)) return true;
  if (hasPermission(user, item.permission)) return true;
  return (item.children || []).some(child => canAccessItem(user, child));
};

const routePermissionRules = flattenNavItems()
  .flatMap(item => (item.routePrefixes || []).map(prefix => ({ prefix, permission: item.permission })))
  .filter(rule => rule.prefix)
  .sort((a, b) => b.prefix.length - a.prefix.length);

const findPermissionForPath = path => {
  const cleanPath = String(path || '/').split('?')[0];
  if (cleanPath === '/') return 'Dashboard';
  const rule = routePermissionRules.find(item => cleanPath === item.prefix || cleanPath.startsWith(`${item.prefix}/`));
  return rule ? rule.permission : null;
};

module.exports = {
  NAV_ITEMS,
  flattenNavItems,
  hasPermission,
  canAccessItem,
  findPermissionForPath,
  isFullAccessUser
};
