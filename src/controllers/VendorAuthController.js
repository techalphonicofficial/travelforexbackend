const bcrypt = require('bcryptjs');

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeEmail = (value) => clean(value).toLowerCase();
const toRegions = (value) => clean(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

class VendorAuthController {
    constructor(authService, models = {}, db = null) {
        this.authService = authService;
        this.models = models;
        this.db = db;
    }

    async loginForm(req, res) {
        const message = req.query.message === 'pending'
            ? 'Your vendor request has been submitted and is pending admin approval.'
            : null;
        res.render('vendor/auth/login', { title: 'Vendor Login - Picktrails', layout: false, message });
    }

    async registerForm(req, res) {
        res.render('vendor/auth/register', {
            title: 'Vendor Register - Picktrails',
            layout: false,
            form: {},
            error: null
        });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.login(email, password);

            if (user.type !== 'vendor') {
                throw new Error('Access denied. This login is for vendors only.');
            }

            if (this.models.VendorProfile) {
                const profile = await this.models.VendorProfile.findOne({ where: { user_id: user.id } });
                if (profile && profile.status !== 'approved') {
                    throw new Error(profile.status === 'rejected'
                        ? 'Your vendor request has been rejected. Please contact support.'
                        : 'Your vendor account is pending admin approval.');
                }
            }

            // Store user in session
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type
            };

            res.redirect('/vendor/dashboard');
        } catch (error) {
            let message = error.message;
            if (message === 'Account is deactivated' && this.models.User && this.models.VendorProfile) {
                const pendingUser = await this.models.User.findOne({ where: { email: normalizeEmail(req.body.email) } }).catch(() => null);
                if (pendingUser && pendingUser.type === 'vendor') {
                    const profile = await this.models.VendorProfile.findOne({ where: { user_id: pendingUser.id } }).catch(() => null);
                    if (profile && profile.status === 'pending') {
                        message = 'Your vendor account is pending admin approval.';
                    } else if (profile && profile.status === 'rejected') {
                        message = 'Your vendor request has been rejected. Please contact support.';
                    }
                }
            }
            res.render('vendor/auth/login', { error: message, message: null, layout: false });
        }
    }

    validateRegistration(data) {
        const requiredFields = {
            owner_name: 'Owner name',
            email: 'Email address',
            phone: 'Phone number',
            password: 'Password',
            confirm_password: 'Confirm password',
            business_name: 'Business name',
            business_type: 'Business type',
            pan_number: 'PAN number',
            address_line1: 'Address',
            city: 'City',
            state: 'State',
            country: 'Country',
            pincode: 'Pincode',
            emergency_contact_name: 'Emergency contact name',
            emergency_contact_phone: 'Emergency contact phone',
            bank_account_name: 'Bank account holder',
            bank_name: 'Bank name',
            bank_account_number: 'Bank account number',
            bank_ifsc: 'IFSC / SWIFT code'
        };

        const missing = Object.entries(requiredFields)
            .filter(([field]) => !clean(data[field]))
            .map(([, label]) => label);

        if (missing.length) {
            throw new Error(`Please complete: ${missing.join(', ')}`);
        }

        const email = normalizeEmail(data.email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Please enter a valid email address.');
        }

        if (clean(data.password).length < 8) {
            throw new Error('Password must be at least 8 characters.');
        }

        if (data.password !== data.confirm_password) {
            throw new Error('Password and confirm password do not match.');
        }

        if (!data.terms_accepted) {
            throw new Error('Please accept the vendor terms to continue.');
        }

        if (clean(data.years_in_business)) {
            const years = Number(data.years_in_business);
            if (!Number.isInteger(years) || years < 0) {
                throw new Error('Years in business must be a valid number.');
            }
        }
    }

    async register(req, res) {
        const form = {
            ...req.body,
            email: normalizeEmail(req.body.email)
        };
        delete form.password;
        delete form.confirm_password;

        let transaction;

        try {
            this.validateRegistration(req.body);

            if (!this.models.User || !this.models.VendorProfile || !this.db) {
                throw new Error('Vendor registration is not configured.');
            }

            const email = normalizeEmail(req.body.email);
            const existing = await this.models.User.findOne({ where: { email } });
            if (existing) {
                throw new Error('An account with this email already exists.');
            }

            transaction = await this.db.transaction();
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = await this.models.User.create({
                name: clean(req.body.owner_name),
                email,
                phone_number: clean(req.body.phone),
                password: hashedPassword,
                role_id: null,
                type: 'vendor',
                status: false
            }, { transaction });

            await this.models.VendorProfile.create({
                user_id: user.id,
                business_name: clean(req.body.business_name),
                legal_name: clean(req.body.legal_name) || null,
                business_type: clean(req.body.business_type),
                gst_number: clean(req.body.gst_number) || null,
                pan_number: clean(req.body.pan_number).toUpperCase(),
                website: clean(req.body.website) || null,
                email,
                phone: clean(req.body.phone),
                address_line1: clean(req.body.address_line1),
                address_line2: clean(req.body.address_line2) || null,
                city: clean(req.body.city),
                state: clean(req.body.state),
                country: clean(req.body.country) || 'India',
                pincode: clean(req.body.pincode),
                service_regions: toRegions(req.body.service_regions),
                years_in_business: clean(req.body.years_in_business) ? Number(req.body.years_in_business) : null,
                emergency_contact_name: clean(req.body.emergency_contact_name),
                emergency_contact_phone: clean(req.body.emergency_contact_phone),
                bank_account_name: clean(req.body.bank_account_name),
                bank_name: clean(req.body.bank_name),
                bank_account_number: clean(req.body.bank_account_number),
                bank_ifsc: clean(req.body.bank_ifsc).toUpperCase(),
                terms_accepted: true,
                status: 'pending',
                metadata: {
                    source: 'vendor_register'
                }
            }, { transaction });

            await transaction.commit();
            transaction = null;

            res.redirect('/vendor/login?message=pending');
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }

            res.status(400).render('vendor/auth/register', {
                title: 'Vendor Register - Picktrails',
                layout: false,
                form,
                error: error.message
            });
        }
    }

    async logout(req, res) {
        req.session.destroy();
        res.redirect('/vendor/login');
    }
}

module.exports = VendorAuthController;
