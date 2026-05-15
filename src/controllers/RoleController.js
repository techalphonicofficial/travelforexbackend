class RoleController {
  constructor(roleService) {
    this.roleService = roleService;
  }

  async index(req, res) {
    try {
      const roles = await this.roleService.getAllRoles();
      res.render('roles/index', { roles, title: 'Role Management' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async createForm(req, res) {
    try {
      const permissions = await this.roleService.getAllPermissions();
      res.render('roles/create', { permissions, title: 'Create New Role' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async store(req, res) {
    try {
      const { name, description, permissions } = req.body;
      const roleId = await this.roleService.createRole({ name, description, permissions: Array.isArray(permissions) ? permissions : [permissions].filter(Boolean) });
      res.redirect('/roles');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async editForm(req, res) {
    try {
      const role = await this.roleService.getRoleById(req.params.id);
      const permissions = await this.roleService.getAllPermissions();
      res.render('roles/edit', { role, permissions, title: 'Edit Role' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async update(req, res) {
    try {
      const { name, description, permissions } = req.body;
      await this.roleService.updateRole(req.params.id, { name, description, permissions: Array.isArray(permissions) ? permissions : [permissions].filter(Boolean) });
      res.redirect('/roles');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async delete(req, res) {
    try {
      await this.roleService.deleteRole(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = RoleController;
