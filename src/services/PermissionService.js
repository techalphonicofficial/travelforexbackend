class PermissionService {
  constructor(permissionRepo, moduleRepo) {
    this.permissionRepo = permissionRepo;
    this.moduleRepo = moduleRepo;
  }

  async getAllPermissions() {
    const permissions = await this.permissionRepo.findAll();
    const modules = await this.moduleRepo.findAll();
    
    return permissions.map(permission => {
      const plainPermission = permission.get ? permission.get({ plain: true }) : permission;
      const module = modules.find(m => String(m.id) === String(plainPermission.module_id));

      return {
        ...plainPermission,
        module_name: module?.name || 'No Module'
      };
    });
  }

  async getPermissionById(id) {
    return this.permissionRepo.findById(id);
  }

  async createPermission(data) {
    return this.permissionRepo.create(data);
  }

  async updatePermission(id, data) {
    return this.permissionRepo.update(id, data);
  }

  async deletePermission(id) {
    return this.permissionRepo.delete(id);
  }

  async getAllModules() {
    return this.moduleRepo.findAll();
  }
}

module.exports = PermissionService;
