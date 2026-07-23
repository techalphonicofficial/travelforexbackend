// ===== EXISTING MODELS =====
const sequelize = require('./database');
const Role = require('./models/Role');
const Module = require('./models/Module');
const Permission = require('./models/Permission');
const User = require('./models/User');
const RolePermission = require('./models/RolePermission');
const Customer = require('./models/Customer');
const VendorProfile = require('./models/VendorProfile');

// ===== TRAVEL MODELS (Phase 1) =====
const Continent = require('./models/Continent');
const Country = require('./models/Country');
const City = require('./models/City');
const Destination = require('./models/Destination');
const DestinationTax = require('./models/DestinationTax');
const DestinationCrowdLevel = require('./models/DestinationCrowdLevel');
const DestinationMapping = require('./models/DestinationMapping');
const Category = require('./models/Category');
const DestinationCategory = require('./models/DestinationCategory');
const PackageCategory = require('./models/PackageCategory');
const PackageCategoryMapping = require('./models/PackageCategoryMapping');
const Package = require('./models/Package');
const PackageBooking = require('./models/PackageBooking');
const BookingPassenger = require('./models/BookingPassenger');
const BookingEmailQueue = require('./models/BookingEmailQueue');
const PassengerFormField = require('./models/PassengerFormField');
const PackageReturnRequest = require('./models/PackageReturnRequest');
const Coupon = require('./models/Coupon');
const CouponRedemption = require('./models/CouponRedemption');
const CouponService = require('./services/CouponService');
const Activity = require('./models/Activity');
const AppSetting = require('./models/AppSetting');
const Theme = require('./models/Theme');
const Media = require('./models/Media');
const PackageInclusion = require('./models/PackageInclusion');
const PackageExclusion = require('./models/PackageExclusion');
const PackageHighlight = require('./models/PackageHighlight');
const PackageDestination = require('./models/PackageDestination');
const PackageDay = require('./models/PackageDay');
const PackageActivity = require('./models/PackageActivity');
const VideoReview = require('./models/VideoReview');
const Review = require('./models/Review');
const TourType = require('./models/TourType');
const Hotel = require('./models/Hotel');
const HotelBooking = require('./models/HotelBooking');
const Airport = require('./models/Airport');
const ForexService = require('./models/ForexService');
const ForexConversionRate = require('./models/ForexConversionRate');
const ForexConversionRequest = require('./models/ForexConversionRequest');
const Newsletter = require('./models/Newsletter');


// ===== CRM MODELS =====
const Pipeline = require('./models/Pipeline');
const PipelineStage = require('./models/PipelineStage');
const LeadFormField = require('./models/LeadFormField');
const Lead = require('./models/Lead');
const LeadFollowUp = require('./models/LeadFollowUp');
const CancellationRule = require('./models/CancellationRule');

// ===== CMS MODELS =====
const Page = require('./models/Page');
const PageDetail = require('./models/PageDetail');
const Banner = require('./models/Banner');
const BlogCategory = require('./models/BlogCategory');


const BlogPost = require('./models/BlogPost');
const BlogDetail = require('./models/BlogDetail');

const Wallet = require('./models/Wallet');
const WalletTransaction = require('./models/WalletTransaction');

// ===== ACCOUNTING MODELS =====
const Account = require('./models/Account');
const JournalEntry = require('./models/JournalEntry');
const JournalEntryLine = require('./models/JournalEntryLine');
const Voucher = require('./models/Voucher');
const VoucherSequence = require('./models/VoucherSequence');

// ===== CUSTOM TRIP MODELS =====
const CustomTrip = require('./models/CustomTrip');
const CustomTripDay = require('./models/CustomTripDay');
const CustomTripActivity = require('./models/CustomTripActivity');

// ===== BOOKING MODELS =====
const Payment = require('./models/Payment');
const TripInquiry = require('./models/TripInquiry');

const Notification = require('./models/Notification');

// Setup Blog Associations
BlogCategory.hasMany(BlogPost, { foreignKey: 'category_id', as: 'posts' });
BlogPost.belongsTo(BlogCategory, { foreignKey: 'category_id', as: 'category' });

BlogPost.hasMany(BlogDetail, { foreignKey: 'blog_id', as: 'details', onDelete: 'CASCADE' });
BlogDetail.belongsTo(BlogPost, { foreignKey: 'blog_id', as: 'post' });

BlogPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(BlogPost, { foreignKey: 'author_id', as: 'blogs' });

// Setup CMS Associations
Page.hasMany(PageDetail, { foreignKey: 'page_id', as: 'details', onDelete: 'CASCADE' });
PageDetail.belongsTo(Page, { foreignKey: 'page_id', as: 'page' });

// Setup Custom Trip Associations
CustomTrip.hasMany(CustomTripDay, { foreignKey: 'custom_trip_id', as: 'days', onDelete: 'CASCADE' });
CustomTripDay.belongsTo(CustomTrip, { foreignKey: 'custom_trip_id', as: 'trip' });

CustomTripDay.hasMany(CustomTripActivity, { foreignKey: 'custom_trip_day_id', as: 'activities', onDelete: 'CASCADE' });
CustomTripActivity.belongsTo(CustomTripDay, { foreignKey: 'custom_trip_day_id', as: 'day' });

CustomTrip.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
CustomTrip.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
CustomTripDay.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
CustomTripActivity.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

// Setup Booking Associations
CustomTrip.hasMany(Payment, { foreignKey: 'custom_trip_id', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(CustomTrip, { foreignKey: 'custom_trip_id', as: 'custom_trip' });

TripInquiry.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(TripInquiry, { foreignKey: 'customer_id', as: 'trip_inquiries' });
TripInquiry.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination_info' });
Destination.hasMany(TripInquiry, { foreignKey: 'destination_id', as: 'trip_inquiries' });

HotelBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(HotelBooking, { foreignKey: 'user_id', as: 'hotel_bookings' });
HotelBooking.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(HotelBooking, { foreignKey: 'customer_id', as: 'hotel_bookings' });

// Setup Package Associations
Package.belongsToMany(PackageCategory, { through: PackageCategoryMapping, foreignKey: 'package_id', as: 'package_categories' });
PackageCategory.belongsToMany(Package, { through: PackageCategoryMapping, foreignKey: 'package_category_id', as: 'packages' });
Package.hasMany(PackageInclusion, { foreignKey: 'package_id', as: 'inclusions', onDelete: 'CASCADE' });
Package.hasMany(PackageExclusion, { foreignKey: 'package_id', as: 'exclusions', onDelete: 'CASCADE' });
Package.hasMany(PackageHighlight, { foreignKey: 'package_id', as: 'highlights', onDelete: 'CASCADE' });
Package.hasMany(PackageDestination, { foreignKey: 'package_id', as: 'destinations', onDelete: 'CASCADE' });
Package.hasMany(VideoReview, { foreignKey: 'package_id', as: 'videoReviews', onDelete: 'SET NULL' });
VideoReview.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
Package.hasMany(Review, { foreignKey: 'package_id', as: 'reviews', onDelete: 'SET NULL' });
Review.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
CustomTrip.hasMany(Review, { foreignKey: 'custom_trip_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(CustomTrip, { foreignKey: 'custom_trip_id', as: 'custom_booking' });
TripInquiry.hasMany(Review, { foreignKey: 'trip_inquiry_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(TripInquiry, { foreignKey: 'trip_inquiry_id', as: 'custom_package' });
Customer.hasMany(Review, { foreignKey: 'customer_id', as: 'reviews', onDelete: 'SET NULL' });
Review.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

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

// Package Itinerary Associations
PackageDestination.hasMany(PackageDay, { foreignKey: 'package_destination_id', as: 'days', onDelete: 'CASCADE' });
PackageDay.belongsTo(PackageDestination, { foreignKey: 'package_destination_id', as: 'packageDestination' });

PackageDay.hasMany(PackageActivity, { foreignKey: 'package_day_id', as: 'activities', onDelete: 'CASCADE' });
PackageActivity.belongsTo(PackageDay, { foreignKey: 'package_day_id', as: 'packageDay' });

// Media Polymorphic Associations
Package.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'package' },
  as: 'gallery'
});
Media.belongsTo(Package, { foreignKey: 'entity_id', constraints: false, as: 'package' });

Review.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'review' },
  as: 'media'
});
Media.belongsTo(Review, { foreignKey: 'entity_id', constraints: false, as: 'review' });

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

Destination.hasMany(DestinationTax, { foreignKey: 'destination_id', as: 'taxes', onDelete: 'CASCADE' });
DestinationTax.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

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
PackageHighlight.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

// Travel Master Associations
Continent.hasMany(Country, { foreignKey: 'continent_id', as: 'countries' });
Country.belongsTo(Continent, { foreignKey: 'continent_id', as: 'continent' });

Country.hasMany(City, { foreignKey: 'country_id', as: 'cities' });
City.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

Country.hasMany(ForexService, { foreignKey: 'country_id', as: 'forexServices' });
ForexService.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Country.hasMany(ForexConversionRate, { foreignKey: 'country_id', as: 'forexConversionRates' });
ForexConversionRate.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Customer.hasMany(ForexConversionRequest, { foreignKey: 'customer_id', as: 'forexConversionRequests', onDelete: 'CASCADE' });
ForexConversionRequest.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Lead.hasMany(ForexConversionRequest, { foreignKey: 'lead_id', as: 'forexConversionRequests', onDelete: 'SET NULL' });
ForexConversionRequest.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
JournalEntry.hasMany(ForexConversionRequest, { foreignKey: 'journal_entry_id', as: 'forexConversionRequests', onDelete: 'SET NULL' });
ForexConversionRequest.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id', as: 'journalEntry' });

Destination.hasMany(DestinationMapping, { foreignKey: 'destination_id', as: 'mappings' });
DestinationMapping.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
DestinationMapping.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

Destination.hasMany(Activity, { foreignKey: 'destination_id', as: 'activities', onDelete: 'CASCADE' });
Activity.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

Destination.hasMany(Hotel, { foreignKey: 'destination_id', as: 'hotels' });
Hotel.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Hotel.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
City.hasMany(Hotel, { foreignKey: 'city_id', as: 'hotels' });
Hotel.hasMany(HotelBooking, { foreignKey: 'hotel_id', as: 'bookings' });
HotelBooking.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
Destination.hasMany(HotelBooking, { foreignKey: 'destination_id', as: 'hotel_bookings' });
HotelBooking.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Hotel.hasMany(Media, {
  foreignKey: 'entity_id',
  constraints: false,
  scope: { entity_type: 'hotel' },
  as: 'gallery'
});
Media.belongsTo(Hotel, { foreignKey: 'entity_id', constraints: false, as: 'hotel' });

Destination.hasMany(DestinationCrowdLevel, { foreignKey: 'destination_id', as: 'crowdLevels', onDelete: 'CASCADE' });
DestinationCrowdLevel.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// PackageCategory -> Category
PackageCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(PackageCategory, { foreignKey: 'category_id', as: 'packageCategories' });

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
User.hasOne(VendorProfile, { foreignKey: 'user_id', as: 'vendorProfile', onDelete: 'CASCADE' });
VendorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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
Package.hasMany(PackageBooking, { foreignKey: 'package_id', as: 'packageBookings' });
PackageBooking.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
User.hasMany(PackageBooking, { foreignKey: 'vendor_id', as: 'vendorPackageBookings' });
PackageBooking.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });
Customer.hasMany(PackageBooking, { foreignKey: 'customer_id', as: 'packageBookings' });
PackageBooking.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Coupon.hasMany(PackageBooking, { foreignKey: 'coupon_id', as: 'packageBookings' });
PackageBooking.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
Coupon.hasMany(CouponRedemption, { foreignKey: 'coupon_id', as: 'redemptions', onDelete: 'CASCADE' });
CouponRedemption.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
PackageBooking.hasOne(CouponRedemption, { foreignKey: 'booking_id', as: 'couponRedemption' });
CouponRedemption.belongsTo(PackageBooking, { foreignKey: 'booking_id', as: 'booking' });
Customer.hasMany(CouponRedemption, { foreignKey: 'customer_id', as: 'couponRedemptions' });
CouponRedemption.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
PackageBooking.hasMany(PackageReturnRequest, { foreignKey: 'booking_id', as: 'returnRequests', onDelete: 'CASCADE' });
PackageReturnRequest.belongsTo(PackageBooking, { foreignKey: 'booking_id', as: 'booking' });
Customer.hasMany(PackageReturnRequest, { foreignKey: 'customer_id', as: 'packageReturnRequests' });
PackageReturnRequest.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
User.hasMany(PackageReturnRequest, { foreignKey: 'requested_by_user_id', as: 'requestedPackageReturns' });
PackageReturnRequest.belongsTo(User, { foreignKey: 'requested_by_user_id', as: 'requestedBy' });
PackageReturnRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' });
PackageReturnRequest.belongsTo(User, { foreignKey: 'rejected_by', as: 'rejectedBy' });

// BookingPassenger Associations
PackageBooking.hasMany(BookingPassenger, { foreignKey: 'booking_id', as: 'passengers', onDelete: 'CASCADE' });
BookingPassenger.belongsTo(PackageBooking, { foreignKey: 'booking_id', as: 'booking' });
PackageBooking.hasMany(BookingEmailQueue, { foreignKey: 'booking_id', as: 'emailQueue', onDelete: 'CASCADE' });
BookingEmailQueue.belongsTo(PackageBooking, { foreignKey: 'booking_id', as: 'booking' });

// Accounting Associations
Voucher.hasOne(JournalEntry, { foreignKey: 'voucher_id', as: 'journalEntry' });
JournalEntry.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' });

JournalEntry.hasMany(JournalEntryLine, { foreignKey: 'journal_entry_id', as: 'lines', onDelete: 'CASCADE' });
JournalEntryLine.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id', as: 'journalEntry' });

Account.hasMany(JournalEntryLine, { foreignKey: 'account_id', as: 'journalLines' });
JournalEntryLine.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

JournalEntry.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Voucher.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Voucher.belongsTo(User, { foreignKey: 'posted_by', as: 'poster' });
Voucher.belongsTo(User, { foreignKey: 'cancelled_by', as: 'canceller' });


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
const PackageCategoryRepository = require('./repositories/PackageCategoryRepository');
const PackageRepository = require('./repositories/PackageRepository');
const CouponRepository = require('./repositories/CouponRepository');
const ActivityRepository = require('./repositories/ActivityRepository');
const AppSettingRepository = require('./repositories/AppSettingRepository');
const ThemeRepository = require('./repositories/ThemeRepository');
const VideoReviewRepository = require('./repositories/VideoReviewRepository');
const ReviewRepository = require('./repositories/ReviewRepository');
const ForexServiceRepository = require('./repositories/ForexServiceRepository');
const ForexConversionRateRepository = require('./repositories/ForexConversionRateRepository');

// ===== CRM REPOSITORIES =====
const PipelineRepository = require('./repositories/PipelineRepository');
const LeadRepository = require('./repositories/LeadRepository');
const FollowUpRepository = require('./repositories/FollowUpRepository');
const MediaRepository = require('./repositories/MediaRepository');
const PageRepository = require('./repositories/PageRepository');
const BannerRepository = require('./repositories/BannerRepository');
const BlogRepository = require('./repositories/BlogRepository');
const WalletRepository = require('./repositories/WalletRepository');
const AccountingRepository = require('./repositories/AccountingRepository');

const UserService = require('./services/UserService');
const AuthService = require('./services/AuthService');
const RoleService = require('./services/RoleService');
const ModuleService = require('./services/ModuleService');
const PermissionService = require('./services/PermissionService');
const CustomerService = require('./services/CustomerService');
const WalletService = require('./services/WalletService');
const VendorService = require('./services/VendorService');
const AccountingService = require('./services/AccountingService');
const BookingEmailService = require('./services/BookingEmailService');
const BookingEmailScheduler = require('./services/BookingEmailScheduler');

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
const ApiBlogController = require('./controllers/ApiBlogController');
const MediaController = require('./controllers/MediaController');
const CategoryController = require('./controllers/CategoryController');
const PackageCategoryController = require('./controllers/PackageCategoryController');
const VendorAuthController = require('./controllers/VendorAuthController');
const VendorDashboardController = require('./controllers/VendorDashboardController');
const VendorPackageController = require('./controllers/VendorPackageController');
const VendorWalletController = require('./controllers/VendorWalletController');
const AccountingController = require('./controllers/AccountingController');
const ApiPackageBookingController = require('./controllers/ApiPackageBookingController');

// ===== MIDDLEWARE =====
const { apiAuth, optionalApiAuth, apiKeyAuth } = require('./middleware/apiAuthMiddleware');

// ===== INITIALIZE EXISTING REPOSITORIES =====
const AirportRepository = require('./repositories/AirportRepository');

const userRepo = new UserRepository(User, Role, Customer, VendorProfile);
const roleRepo = new RoleRepository(Role, Permission);
const permissionRepo = new PermissionRepository(Permission, Module);
const moduleRepo = new ModuleRepository(Module, Permission);
const customerRepo = new CustomerRepository(Customer, User);

// ===== INITIALIZE TRAVEL REPOSITORIES =====
const continentRepo = new ContinentRepository(Continent);
const countryRepo = new CountryRepository(Country, Continent);
const cityRepo = new CityRepository(City, Country, Continent);
const airportRepo = new AirportRepository(Airport);
const categoryRepo = new CategoryRepository(Category);
const packageCategoryRepo = new PackageCategoryRepository(PackageCategory, Category);
const destinationRepo = new DestinationRepository(Destination, Category, DestinationMapping, Media, City, Country, Continent, Package);
const packageRepo = new PackageRepository(Package, Destination, Activity, Media, PackageInclusion, PackageExclusion, PackageDestination, Review, PackageHighlight);
const couponRepo = new CouponRepository(Coupon, CouponRedemption);
const activityRepo = new ActivityRepository(Activity, Destination);
const appSettingRepo = new AppSettingRepository(AppSetting);
const themeRepo = new ThemeRepository(Theme);
const videoReviewRepo = new VideoReviewRepository(VideoReview, Package);
const reviewRepo = new ReviewRepository(Review, Media, Package, CustomTrip, Customer, User, TripInquiry);
const forexServiceRepo = new ForexServiceRepository(ForexService, Country, Continent);
const forexConversionRateRepo = new ForexConversionRateRepository(ForexConversionRate, Country, Continent);

// ===== INITIALIZE CRM REPOSITORIES =====
const pipelineRepo = new PipelineRepository(Pipeline, PipelineStage, LeadFormField);
const leadRepo = new LeadRepository(Lead, Pipeline, PipelineStage, LeadFormField, User);
const followUpRepo = new FollowUpRepository(LeadFollowUp, Lead, User);
const mediaRepo = new MediaRepository(Media);
const pageRepo = new PageRepository(Page, PageDetail);
const bannerRepo = new BannerRepository(Banner);
const blogRepo = new BlogRepository(BlogPost, BlogCategory, BlogDetail, User);
const walletRepo = new WalletRepository(Wallet, WalletTransaction);
const accountingRepo = new AccountingRepository(Account, JournalEntry, JournalEntryLine, sequelize, Voucher, VoucherSequence);

// ===== INITIALIZE EXISTING SERVICES =====
const HotelRepository = require('./repositories/HotelRepository');
const hotelRepo = new HotelRepository(Hotel);

const HotelBookingRepository = require('./repositories/HotelBookingRepository');
const hotelBookingRepo = new HotelBookingRepository(HotelBooking, Hotel, User, Customer, Destination);

const CustomTripRepository = require('./repositories/CustomTripRepository');
const customTripRepo = new CustomTripRepository(CustomTrip, CustomTripDay, CustomTripActivity, Hotel, Activity, Destination);

const BookingRepository = require('./repositories/BookingRepository');
const bookingRepo = new BookingRepository(null, Payment, Customer, Package, CustomTrip);

const TripInquiryRepository = require('./repositories/TripInquiryRepository');
const tripInquiryRepo = new TripInquiryRepository(TripInquiry, Destination, Customer, User, Media);

const TripBuilderService = require('./services/TripBuilderService');
const tripBuilderService = new TripBuilderService(customTripRepo, hotelRepo, activityRepo, packageRepo);
const userService = new UserService(userRepo, roleRepo);
const authService = new AuthService(userRepo, roleRepo, customerRepo);
const roleService = new RoleService(roleRepo, permissionRepo);
const moduleService = new ModuleService(moduleRepo);
const permissionService = new PermissionService(permissionRepo, moduleRepo);
const customerService = new CustomerService(customerRepo);
const accountingService = new AccountingService(accountingRepo);
const walletService = new WalletService(walletRepo, accountingService);
const vendorService = new VendorService(packageRepo, walletService);
const bookingEmailService = new BookingEmailService({ BookingEmailQueue, PackageBooking, Customer, User }, { appSettingRepo });
const bookingEmailScheduler = new BookingEmailScheduler(bookingEmailService);

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
const apiBlogController = new ApiBlogController(blogRepo);
const mediaController = new MediaController(mediaRepo);
const categoryController = new CategoryController(categoryRepo, Category, sequelize);
const packageCategoryController = new PackageCategoryController(packageCategoryRepo, PackageCategory);
const vendorAuthController = new VendorAuthController(authService, { User, VendorProfile }, sequelize);
const vendorDashboardController = new VendorDashboardController(vendorService, walletService);
const vendorPackageController = new VendorPackageController(vendorService, packageRepo, destinationRepo, categoryRepo, activityRepo, sequelize, {
  Package, PackageDestination, PackageInclusion, PackageExclusion, PackageHighlight, Destination, Activity, Media, Hotel
});
const vendorWalletController = new VendorWalletController(walletService);
const accountingController = new AccountingController(accountingService);
const apiPackageBookingController = new ApiPackageBookingController({ Package, PackageBooking, BookingPassenger, BookingEmailQueue, PackageReturnRequest, Customer, User, Role, CancellationRule, Coupon, CouponRedemption }, accountingService, sequelize, bookingEmailService);
const couponService = new CouponService({ Coupon, CouponRedemption });

const AdminWalletController = require('./controllers/AdminWalletController');
const adminWalletController = new AdminWalletController(walletService);

const AdminVendorController = require('./controllers/AdminVendorController');
const adminVendorController = new AdminVendorController({ VendorProfile, User });

const AdminBookingController = require('./controllers/AdminBookingController');
const adminBookingController = new AdminBookingController(bookingRepo, accountingService, walletService, tripInquiryRepo, hotelBookingRepo);

const AdminTripBuilderController = require('./controllers/AdminTripBuilderController');
const adminTripBuilderController = new AdminTripBuilderController(tripBuilderService, hotelRepo, activityRepo, bookingRepo, accountingService, appSettingRepo, couponService);

const TravelHotelController = require('./controllers/TravelHotelController');
const travelHotelController = new TravelHotelController(Hotel, Destination);

const TravelActivityController = require('./controllers/TravelActivityController');
const travelActivityController = new TravelActivityController(Activity, Destination);

const ApiAirportController = require('./controllers/ApiAirportController');
const apiAirportController = new ApiAirportController(airportRepo);

const ApiTripInquiryController = require('./controllers/ApiTripInquiryController');
const apiTripInquiryController = new ApiTripInquiryController(tripInquiryRepo, leadRepo, pipelineRepo);

const ApiHotelBookingController = require('./controllers/ApiHotelBookingController');
const apiHotelBookingController = new ApiHotelBookingController(hotelBookingRepo, leadRepo, pipelineRepo);

module.exports = {
  db: sequelize,
  models: {
    User, Role, Module, Permission, RolePermission, Customer, VendorProfile,
    Continent, Country, City,
    Destination, DestinationMapping, DestinationCrowdLevel, DestinationTax,
    Category, DestinationCategory, PackageCategory, PackageCategoryMapping,
    Package, PackageBooking, BookingPassenger, BookingEmailQueue, PassengerFormField, PackageReturnRequest, Coupon, CouponRedemption, PackageInclusion, PackageExclusion, PackageHighlight, PackageDestination,
    Activity, AppSetting, Theme, Media, VideoReview, Review, TourType, Hotel, HotelBooking,
    Pipeline, PipelineStage, LeadFormField, Lead, LeadFollowUp, CancellationRule,
    Page, PageDetail, Banner, BlogCategory, BlogPost, BlogDetail,
    Wallet, WalletTransaction,
    Account, JournalEntry, JournalEntryLine, Voucher, VoucherSequence,
    CustomTrip, CustomTripDay, CustomTripActivity,
    Payment, TripInquiry, Airport, ForexService, ForexConversionRate, ForexConversionRequest, Newsletter,
    Notification
  },
  repositories: {
    userRepo, roleRepo, permissionRepo, moduleRepo, customerRepo,
    continentRepo, countryRepo, cityRepo, airportRepo, forexServiceRepo, forexConversionRateRepo,
    destinationRepo, categoryRepo, packageCategoryRepo,
    packageRepo, couponRepo, activityRepo, appSettingRepo, themeRepo, videoReviewRepo, reviewRepo,
    pipelineRepo, leadRepo, followUpRepo, mediaRepo, pageRepo, bannerRepo, blogRepo,
    walletRepo, accountingRepo, hotelRepo, hotelBookingRepo, customTripRepo, bookingRepo, tripInquiryRepo
  },
  services: {
    userService, authService, roleService, moduleService, permissionService, customerService,
    walletService, vendorService, accountingService, tripBuilderService, bookingEmailService, bookingEmailScheduler
  },
  controllers: {
    roleController, moduleController, permissionController, userController, crmCustomerController, authController, apiCustomerController, apiBlogController,
    pageController, bannerController, blogController, mediaController, categoryController, packageCategoryController, vendorAuthController,
    vendorDashboardController, vendorPackageController, vendorWalletController, accountingController, adminWalletController, adminVendorController, adminBookingController, adminTripBuilderController, travelHotelController, travelActivityController, apiAirportController, apiTripInquiryController, apiHotelBookingController, apiPackageBookingController
  },
  middleware: {
    apiAuth, optionalApiAuth, apiKeyAuth
  }
};
