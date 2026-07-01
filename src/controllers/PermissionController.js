class PermissionController {
  constructor(permissionService) {
    this.permissionService = permissionService;
  }

  async index(req, res) {
    try {
      const permissions = await this.permissionService.getAllPermissions();
      res.render('permissions/index', { permissions, title: 'Permission Management' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async createForm(req, res) {
    try {
      const modules = await this.permissionService.getAllModules();
      res.render('permissions/create', { modules, title: 'Create New Permission' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async store(req, res) {
    try {
      await this.permissionService.createPermission(req.body);
      res.redirect('/permissions');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async editForm(req, res) {
    try {
      const permission = await this.permissionService.getPermissionById(req.params.id);
      if (!permission) return res.status(404).send('Permission not found');
      const modules = await this.permissionService.getAllModules();
      res.render('permissions/edit', { permission, modules, title: 'Edit Permission' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async update(req, res) {
    try {
      await this.permissionService.updatePermission(req.params.id, req.body);
      res.redirect('/permissions');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async delete(req, res) {
    try {
      await this.permissionService.deletePermission(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = PermissionController;
