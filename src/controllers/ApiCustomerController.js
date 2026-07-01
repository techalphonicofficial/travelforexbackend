class ApiCustomerController {
    constructor(authService, customerService, leadRepo) {
        this.authService = authService;
        this.customerService = customerService;
        this.leadRepo = leadRepo;
    }

    async register(req, res) {
        try {
            const { name, email, password, phone } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Name, email and password are required' });
            }

            const userData = { name, email, password, phone_number: phone };

            //   const customerData = { phone, address, city, state, pincode };

            const { user } = await this.authService.customerRegister(userData);
            const token = this.authService.generateToken(user);
            const roleName = user.role_name || (user.role ? user.role.name : null);

            res.status(201).json({
                success: true,
                message: 'Customer registered successfully',
                data: {
                    user: { id: user.id, name: user.name, email: user.email, type: user.type, role_id: user.role_id || null, role_name: roleName, phone_number: user.phone_number, token: token },

                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const user = await this.authService.login(email, password);

            if (user.type !== 'customer') {
                // Optionally restrict API login to customers only, depends on requirements. We allow it here or throw.
                // If we strictly want only customers for this endpoint:
                // return res.status(403).json({ success: false, message: 'Only customers can login here.' });
            }

            const token = this.authService.generateToken(user);
            const roleName = user.role_name || (user.role ? user.role.name : null);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: { id: user.id, name: user.name, email: user.email, type: user.type, role_id: user.role_id || null, role_name: roleName },
                    token
                }
            });
        } catch (error) {
            if (error.message === 'User not found' || error.message === 'Invalid credentials') {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const profile = await this.customerService.getCustomerProfile(userId);

            if (!profile) {
                return res.status(404).json({ success: false, message: 'Profile not found' });
            }

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Exclude sensitive fields from customer-driven update
            const { id, user_id, ...safeData } = updateData;

            await this.customerService.updateProfile(userId, safeData);

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ success: false, message: 'New password is required' });
            }

            await this.authService.changePassword(userId, password);

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getMyInquiries(req, res) {
        try {
            const userId = req.user.id;
            const inquiries = await this.leadRepo.findByCustomerId(userId);

            res.json({
                success: true,
                data: inquiries
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

            const token = await this.authService.requestPasswordReset(email);

            // In production, you would send this token via email.
            // For now, we return it in the response for development/testing.
            res.json({
                success: true,
                message: 'Password reset token generated',
                data: { token } // Remove this in production!
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ success: false, message: 'Token and new password are required' });
            }

            await this.authService.resetPassword(token, password);

            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            if (error.message === 'Invalid or expired token') {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

}

module.exports = ApiCustomerController;
