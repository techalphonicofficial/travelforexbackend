const BaseRepository = require('./BaseRepository');

class RoleRepository extends BaseRepository {
  constructor(Role, Permission) {
    super(Role);
    this.Permission = Permission;
  }

  async getRolePermissions(roleId) {
    const role = await this.model.findByPk(roleId, {
      include: [{ model: this.Permission, as: 'permissions' }]
    });
    return role ? role.permissions : [];
  }

  async assignPermission(roleId, permissionId) {
    const role = await this.model.findByPk(roleId);
    if (!role) return null;
    return role.addPermission(permissionId);
  }

  async removePermission(roleId, permissionId) {
    const role = await this.model.findByPk(roleId);
    if (!role) return null;
    return role.removePermission(permissionId);
  }
}

module.exports = RoleRepository;
