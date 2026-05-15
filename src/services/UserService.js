const bcrypt = require('bcryptjs');

class UserService {
  constructor(userRepo, roleRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
  }

  async getAllUsers() {
    return this.userRepo.getUsersWithRoles();
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
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userRepo.create(userData);
  }

  async updateUser(id, userData) {
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
