const BaseRepository = require('./BaseRepository');

class ModuleRepository extends BaseRepository {
  constructor(Module, Permission) {
    super(Module);
    this.Permission = Permission;
  }

  async getModulesWithPermissions() {
    return this.model.findAll({
      include: [{ model: this.Permission, as: 'permissions' }]
    });
  }
}

module.exports = ModuleRepository;
