class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async index(req, res) {
    try {
      const allowedTypes = ['employee', 'customer', 'vendor', 'all'];
      const filters = {
        type: allowedTypes.includes(req.query.type) ? req.query.type : 'employee',
        search: String(req.query.search || '').trim(),
        role_id: req.query.role_id || '',
        status: req.query.status || ''
      };

      const [users, roles, typeCounts] = await Promise.all([
        this.userService.getAllUsers(filters),
        this.userService.getAllRoles(),
        this.userService.getUserCountsByType()
      ]);

      res.render('users/index', {
        users,
        roles,
        filters,
        typeCounts,
        title: 'User Management'
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async createForm(req, res) {
    try {
      const roles = await this.userService.getAllRoles();
      res.render('users/create', { roles, title: 'Create New User' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async store(req, res) {
    try {
      const userData = req.body;
      await this.userService.createUser(userData);
      res.redirect('/users');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async editForm(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      const roles = await this.userService.getAllRoles();
      res.render('users/edit', { user, roles, title: 'Edit User' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async update(req, res) {
    try {
      await this.userService.updateUser(req.params.id, req.body);
      res.redirect('/users');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async delete(req, res) {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async changePasswordForm(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.render('users/change-password', { user, title: 'Change Password' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async updatePassword(req, res) {
    try {
      const { password, confirm_password } = req.body;
      if (password !== confirm_password) {
        throw new Error('Passwords do not match');
      }
      await this.userService.changePassword(req.params.id, password);
      res.redirect('/users');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
}

module.exports = UserController;
