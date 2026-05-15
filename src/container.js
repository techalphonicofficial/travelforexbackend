// ===== EXISTING MODELS =====
const sequelize = require('./database');
const Role = require('./models/Role');
const Module = require('./models/Module');
const Permission = require('./models/Permission');
const User = require('./models/User');
const RolePermission = require('./models/RolePermission');
const Customer = require('./models/Customer');

// ===== TRAVEL MODELS (Phase 1) =====
const Continent = require('./models/Continent');
const Country = require('./models/Country');
const City = require('./models/City');
const Destination = require('./models/Destination');
const DestinationMapping = require('./models/DestinationMapping');
const Category = require('./models/Category');
const DestinationCategory = require('./models/DestinationCategory');
const Package = require('./models/Package');
const Activity = require('./models/Activity');
const AppSetting = require('./models/AppSetting');
const Media = require('./models/Media');
const PackageInclusion = require('./models/PackageInclusion');
const PackageExclusion = require('./models/PackageExclusion');
const PackageDestination = require('./models/PackageDestination');
const VideoReview = require('./models/VideoReview');

// ===== CRM MODELS =====
const Pipeline = require('./models/Pipeline');
const PipelineStage = require('./models/PipelineStage');
const LeadFormField = require('./models/LeadFormField');
const Lead = require('./models/Lead');
const LeadFollowUp = require('./models/LeadFollowUp');

// ===== CMS MODELS =====
const Page = require('./models/Page');
const PageDetail = require('./models/PageDetail');
const Banner = require('./models/Banner');
const BlogCategory = require('./models/BlogCategory');
const BlogPost = require('./models/BlogPost');
const Wallet = require('./models/Wallet');
const WalletTransaction = require('./models/WalletTransaction');

// Setup Blog Associations
BlogCategory.hasMany(BlogPost, { foreignKey: 'category_id', as: 'posts' });
BlogPost.belongsTo(BlogCategory, { foreignKey: 'category_id', as: 'category' });

// Setup CMS Associations
Page.hasMany(PageDetail, { foreignKey: 'page_id', as: 'details', onDelete: 'CASCADE' });
PageDetail.belongsTo(Page, { foreignKey: 'page_id', as: 'page' });

// Setup Package Associations
Package.hasMany(PackageInclusion, { foreignKey: 'package_id', as: 'inclusions', onDelete: 'CASCADE' });
Package.hasMany(PackageExclusion, { foreignKey: 'package_id', as: 'exclusions', onDelete: 'CASCADE' });
Package.hasMany(PackageDestination, { foreignKey: 'package_id', as: 'destinations', onDelete: 'CASCADE' });
Package.hasMany(VideoReview, { foreignKey: 'package_id', as: 'videoReviews', onDelete: 'SET NULL' });
VideoReview.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

// ===== CRM ASSOCIATIONS =====
Pipeline.hasMany(PipelineStage, { foreignKey: 'pipeline_id', as: 'stages', onDelete: 'CASCADE' });
PipelineStage.belongsTo(Pipeline, { foreignKey: 'pipeline_id', as: 'pipeline' });

Pipeline.hasMany(LeadFormField, { foreignKey: 'pipeline_id', as: 'formFields', onDelete: 'CASCADE' });
LeadFormField.belongsTo(Pipeline, { foreignKey: 'pipeline_id', as: 'pipeline' });

Pipeline.hasMany(Lead, { foreignKey: 'pipeline_id', as: 'leads', onDelete: 'SET NULL' });
Lead.belongsTo(Pipeline, { foreignKey: 'pipeline_id', as: 'pipeline' });
Lead.belongsTo(PipelineStage, { foreignKey: 'stage_id', as: 'stage' });
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

Lead.hasMany(LeadFollowUp, { foreignKey: 'lead_id', as: 'followUps', onDelete: 'CASCADE' });
LeadFollowUp.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
LeadFollowUp.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

PackageDestination.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
PackageDestination.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// Media Polymorphic Associations
Package.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'package' },
  as: 'gallery'
});
Media.belongsTo(Package, { foreignKey: 'entity_id', constraints: false, as: 'package' });

// Destination Associations
Destination.belongsToMany(Category, {
  through: DestinationCategory,
  foreignKey: 'destination_id',
  otherKey: 'category_id',
  as: 'categories'
});
Destination.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'destination' },
  as: 'gallery'
});
Media.belongsTo(Destination, { foreignKey: 'entity_id', constraints: false, as: 'destination' });

Page.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'page' },
  as: 'media'
});
Media.belongsTo(Page, { foreignKey: 'entity_id', constraints: false, as: 'page' });

Banner.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'banner' },
  as: 'media'
});
Media.belongsTo(Banner, { foreignKey: 'entity_id', constraints: false, as: 'banner' });

BlogPost.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'blog_post' },
  as: 'media'
});
Media.belongsTo(BlogPost, { foreignKey: 'entity_id', constraints: false, as: 'blog_post' });

Destination.belongsToMany(Package, {
  through: PackageDestination,
  foreignKey: 'destination_id',
  otherKey: 'package_id',
  as: 'packages'
});

PackageInclusion.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
PackageExclusion.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

// Travel Master Associations
Continent.hasMany(Country, { foreignKey: 'continent_id', as: 'countries' });
Country.belongsTo(Continent, { foreignKey: 'continent_id', as: 'continent' });

Country.hasMany(City, { foreignKey: 'country_id', as: 'cities' });
City.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

Destination.hasMany(DestinationMapping, { foreignKey: 'destination_id', as: 'mappings' });
DestinationMapping.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
DestinationMapping.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

Destination.hasMany(Activity, { foreignKey: 'destination_id', as: 'activities', onDelete: 'CASCADE' });
Activity.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// Category and DestinationCategory M:N
Category.belongsToMany(Destination, {
  through: DestinationCategory,
  foreignKey: 'category_id',
  as: 'destinations'
});

// System (RBAC) Associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.hasOne(Customer, { foreignKey: 'user_id', as: 'customerProfile', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  as: 'roles'
});

Permission.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Module.hasMany(Permission, { foreignKey: 'module_id', as: 'permissions' });

// Wallet Associations
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Wallet.hasMany(WalletTransaction, { foreignKey: 'wallet_id', as: 'transactions', onDelete: 'CASCADE' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

// Package Vendor Association
Package.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });
User.hasMany(Package, { foreignKey: 'vendor_id', as: 'vendorPackages' });



// ===== EXISTING REPOSITORIES =====
const UserRepository = require('./repositories/UserRepository');
const RoleRepository = require('./repositories/RoleRepository');
const PermissionRepository = require('./repositories/PermissionRepository');
const ModuleRepository = require('./repositories/ModuleRepository');
const CustomerRepository = require('./repositories/CustomerRepository');

// ===== TRAVEL REPOSITORIES (Phase 1) =====
const ContinentRepository = require('./repositories/ContinentRepository');
const CountryRepository = require('./repositories/CountryRepository');
const CityRepository = require('./repositories/CityRepository');
const DestinationRepository = require('./repositories/DestinationRepository');
const CategoryRepository = require('./repositories/CategoryRepository');
const PackageRepository = require('./repositories/PackageRepository');
const ActivityRepository = require('./repositories/ActivityRepository');
const AppSettingRepository = require('./repositories/AppSettingRepository');
const VideoReviewRepository = require('./repositories/VideoReviewRepository');

// ===== CRM REPOSITORIES =====
const PipelineRepository = require('./repositories/PipelineRepository');
const LeadRepository = require('./repositories/LeadRepository');
const FollowUpRepository = require('./repositories/FollowUpRepository');
const MediaRepository = require('./repositories/MediaRepository');
const PageRepository = require('./repositories/PageRepository');
const BannerRepository = require('./repositories/BannerRepository');
const BlogRepository = require('./repositories/BlogRepository');
const WalletRepository = require('./repositories/WalletRepository');

// ===== EXISTING SERVICES =====
const UserService = require('./services/UserService');
const AuthService = require('./services/AuthService');
const RoleService = require('./services/RoleService');
const ModuleService = require('./services/ModuleService');
const PermissionService = require('./services/PermissionService');
const CustomerService = require('./services/CustomerService');
const WalletService = require('./services/WalletService');
const VendorService = require('./services/VendorService');

// ===== EXISTING CONTROLLERS =====
const RoleController = require('./controllers/RoleController');
const ModuleController = require('./controllers/ModuleController');
const PermissionController = require('./controllers/PermissionController');
const UserController = require('./controllers/UserController');
const CrmCustomerController = require('./controllers/CrmCustomerController');
const AuthController = require('./controllers/AuthController');
const ApiCustomerController = require('./controllers/ApiCustomerController');
const PageController = require('./controllers/PageController');
const BannerController = require('./controllers/BannerController');
const BlogController = require('./controllers/BlogController');
const MediaController = require('./controllers/MediaController');
const CategoryController = require('./controllers/CategoryController');
const VendorAuthController = require('./controllers/VendorAuthController');
const VendorDashboardController = require('./controllers/VendorDashboardController');
const VendorPackageController = require('./controllers/VendorPackageController');
const VendorWalletController = require('./controllers/VendorWalletController');

// ===== MIDDLEWARE =====
const { apiAuth } = require('./middleware/apiAuthMiddleware');

// ===== INITIALIZE EXISTING REPOSITORIES =====
const userRepo = new UserRepository(User, Role);
const roleRepo = new RoleRepository(Role, Permission);
const permissionRepo = new PermissionRepository(Permission, Module);
const moduleRepo = new ModuleRepository(Module, Permission);
const customerRepo = new CustomerRepository(Customer, User);

// ===== INITIALIZE TRAVEL REPOSITORIES =====
const continentRepo = new ContinentRepository(Continent);
const countryRepo = new CountryRepository(Country, Continent);
const cityRepo = new CityRepository(City, Country, Continent);
const categoryRepo = new CategoryRepository(Category);
const destinationRepo = new DestinationRepository(Destination, Category, DestinationMapping, Media, City, Country, Continent, Package);
const packageRepo = new PackageRepository(Package, Destination, Activity, Media, PackageInclusion, PackageExclusion, PackageDestination);
const activityRepo = new ActivityRepository(Activity, Destination);
const appSettingRepo = new AppSettingRepository(AppSetting);
const videoReviewRepo = new VideoReviewRepository(VideoReview, Package);

// ===== INITIALIZE CRM REPOSITORIES =====
const pipelineRepo = new PipelineRepository(Pipeline, PipelineStage, LeadFormField);
const leadRepo = new LeadRepository(Lead, Pipeline, PipelineStage, LeadFormField, User);
const followUpRepo = new FollowUpRepository(LeadFollowUp, Lead, User);
const mediaRepo = new MediaRepository(Media);
const pageRepo = new PageRepository(Page, PageDetail);
const bannerRepo = new BannerRepository(Banner);
const blogRepo = new BlogRepository(BlogPost, BlogCategory);
const walletRepo = new WalletRepository(Wallet, WalletTransaction);

// ===== INITIALIZE EXISTING SERVICES =====
const userService = new UserService(userRepo, roleRepo);
const authService = new AuthService(userRepo, roleRepo, customerRepo);
const roleService = new RoleService(roleRepo, permissionRepo);
const moduleService = new ModuleService(moduleRepo);
const permissionService = new PermissionService(permissionRepo, moduleRepo);
const customerService = new CustomerService(customerRepo);
const walletService = new WalletService(walletRepo);
const vendorService = new VendorService(packageRepo, walletService);

// ===== INITIALIZE EXISTING CONTROLLERS =====
const roleController = new RoleController(roleService);
const moduleController = new ModuleController(moduleService);
const permissionController = new PermissionController(permissionService);
const userController = new UserController(userService);
const crmCustomerController = new CrmCustomerController(userService);
const authController = new AuthController(authService);
const apiCustomerController = new ApiCustomerController(authService, customerService, leadRepo);
const pageController = new PageController(pageRepo, mediaRepo);
const bannerController = new BannerController(bannerRepo, mediaRepo);
const blogController = new BlogController(blogRepo, mediaRepo);
const mediaController = new MediaController(mediaRepo);
const categoryController = new CategoryController(categoryRepo, Category, sequelize);
const vendorAuthController = new VendorAuthController(authService);
const vendorDashboardController = new VendorDashboardController(vendorService, walletService);
const vendorPackageController = new VendorPackageController(vendorService, packageRepo, destinationRepo, categoryRepo, activityRepo, sequelize, { 
    Package, PackageDestination, PackageInclusion, PackageExclusion, Destination, Activity, Media 
});
const vendorWalletController = new VendorWalletController(walletService);

module.exports = {
  db: sequelize,
  models: {
    User, Role, Module, Permission, RolePermission, Customer,
    Continent, Country, City,
    Destination, DestinationMapping,
    Category, DestinationCategory,
    Package, PackageInclusion, PackageExclusion, PackageDestination,
    Activity, AppSetting, Media, VideoReview,
    Pipeline, PipelineStage, LeadFormField, Lead, LeadFollowUp,
    Page, PageDetail, Banner, BlogCategory, BlogPost,
    Wallet, WalletTransaction
  },
  repositories: {
    userRepo, roleRepo, permissionRepo, moduleRepo, customerRepo,
    continentRepo, countryRepo, cityRepo,
    destinationRepo, categoryRepo,
    packageRepo, activityRepo, appSettingRepo, videoReviewRepo,
    pipelineRepo, leadRepo, followUpRepo, mediaRepo, pageRepo, bannerRepo, blogRepo,
    walletRepo
  },
  services: {
    userService, authService, roleService, moduleService, permissionService, customerService,
    walletService, vendorService
  },
  controllers: {
    roleController, moduleController, permissionController, userController, crmCustomerController, authController, apiCustomerController,
    pageController, bannerController, blogController, mediaController, categoryController,
    vendorAuthController, vendorDashboardController, vendorPackageController, vendorWalletController
  },
  middleware: {
    apiAuth
  }
};
