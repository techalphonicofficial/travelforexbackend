const bcrypt = require('bcryptjs');

class UserService {
  constructor(userRepo, roleRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
  }

  normalizeUserData(userData = {}, { isCreate = false } = {}) {
    const normalized = { ...userData };

    if (normalized.phone && !normalized.phone_number) {
      normalized.phone_number = normalized.phone;
    }
    delete normalized.phone;

    if (isCreate && !normalized.type) normalized.type = 'employee';
    if (normalized.status === 'true') normalized.status = true;
    if (normalized.status === 'false') normalized.status = false;
    if (normalized.role_id === '') normalized.role_id = null;

    return normalized;
  }

  async getAllUsers(filters = {}) {
    return this.userRepo.getUsersWithRoles(filters);
  }

  async getUserCountsByType() {
    return this.userRepo.countByType();
  }

  async getCustomers() {
    return this.userRepo.findCustomers();
  }

  async getUserById(id) {
    const user = await this.userRepo.findById(id);
    if (!user) return null;

    const role = await this.roleRepo.findById(user.role_id);
    user.role_name = role ? role.name : 'No Role';
    return user;
  }

  async createUser(userData) {
    userData = this.normalizeUserData(userData, { isCreate: true });
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userRepo.create(userData);
  }

  async updateUser(id, userData) {
    userData = this.normalizeUserData(userData);
    // Exclude password from general update if present
    const { password, ...updateData } = userData;
    return this.userRepo.update(id, updateData);
  }

  async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userRepo.update(id, { password: hashedPassword });
  }

  async deleteUser(id) {
    return this.userRepo.delete(id);
  }

  async getAllRoles() {
    return this.roleRepo.findAll();
  }
}

module.exports = UserService;
