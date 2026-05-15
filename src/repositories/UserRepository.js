const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor(User, Role) {
    super(User);
    this.Role = Role;
  }

  async findByEmail(email) {
    return this.model.findOne({
      where: { email },
      include: [{ model: this.Role, as: 'role' }]
    });
  }

  async getUsersWithRoles() {
    return this.model.findAll({
      include: [{ model: this.Role, as: 'role' }]
    });
  }

  async findCustomers() {
    return this.model.findAll({
      where: { type: 'customer' },
      include: [{ model: this.Role, as: 'role' }]
    });
  }
}

module.exports = UserRepository;
