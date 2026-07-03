class RoleService {
  constructor(roleRepo, permissionRepo) {
    this.roleRepo = roleRepo;
    this.permissionRepo = permissionRepo;
  }

  async getAllRoles() {
    return this.roleRepo.findAll();
  }
///sddsdfadsadfsadf
  async getRoleById(id) {
    const role = await this.roleRepo.findById(id);
    if (role) {
      role.permissions = await this.roleRepo.getRolePermissions(id);
    }
    return role;
  }

  async createRole(data) {
    const { name, description, permissions } = data;
    const roleId = await this.roleRepo.create({ name, description });
    
    if (permissions && Array.isArray(permissions)) {
      for (const permissionId of permissions) {
        await this.roleRepo.assignPermission(roleId, permissionId);
      }
    }
    
    return roleId;
  }

  async updateRole(id, data) {
    const { name, description, permissions } = data;
    await this.roleRepo.update(id, { name, description });
    
    // Simple sync: remove all and re-add
    const existingPermissions = await this.roleRepo.getRolePermissions(id);
    for (const ep of existingPermissions) {
      await this.roleRepo.removePermission(id, ep.id);
    }
    
    if (permissions && Array.isArray(permissions)) {
      for (const permissionId of permissions) {
        await this.roleRepo.assignPermission(id, permissionId);
      }
    }
  }

  async deleteRole(id) {
    return this.roleRepo.delete(id);
  }

  async getAllPermissions() {
    return this.permissionRepo.findAll();
  }
}

module.exports = RoleService;
