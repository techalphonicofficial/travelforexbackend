class VendorAuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async loginForm(req, res) {
        res.render('vendor/auth/login', { title: 'Vendor Login - Picktrails', layout: false });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.login(email, password);

            if (user.type !== 'vendor') {
                throw new Error('Access denied. This login is for vendors only.');
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
            res.render('vendor/auth/login', { error: error.message, layout: false });
        }
    }

    async logout(req, res) {
        req.session.destroy();
        res.redirect('/vendor/login');
    }
}

module.exports = VendorAuthController;
