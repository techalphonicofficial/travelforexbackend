class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async loginForm(req, res) {
    res.render('auth/login', { title: 'Login - Travel & Forex Dashboard', layout: false });
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.authService.login(email, password);
      const roleName = user.role_name || (user.role ? user.role.name : null);

      // Store user in session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        role_id: user.role_id,
        role_name: roleName,
        permissions: user.permissions
      };

      res.redirect('/');
    } catch (error) {
      res.render('auth/login', { error: error.message, layout: false });
    }
  }

  async logout(req, res) {
    req.session.destroy();
    res.redirect('/auth/login');
  }
}

module.exports = AuthController;
