const BaseRepository = require('./BaseRepository');

class PermissionRepository extends BaseRepository {
  constructor(Permission, Module) {
    super(Permission);
    this.Module = Module;
  }

  async getPermissionsByModule(moduleId) {
    return this.model.findAll({ where: { module_id: moduleId } });
  }

  async getModules() {
    return this.Module.findAll();
  }

  async getPermissionsWithModules() {
    return this.model.findAll({
      include: [{ model: this.Module, as: 'module' }]
    });
  }
}

module.exports = PermissionRepository;
