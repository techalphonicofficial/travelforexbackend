const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor(User, Role, Customer = null, VendorProfile = null) {
    super(User);
    this.Role = Role;
    this.Customer = Customer;
    this.VendorProfile = VendorProfile;
  }

  async findByEmail(email) {
    return this.model.findOne({
      where: { email },
      include: [{ model: this.Role, as: 'role' }]
    });
  }

  getIncludes() {
    return [
      this.Role ? { model: this.Role, as: 'role' } : null,
      this.Customer ? { model: this.Customer, as: 'customerProfile', required: false } : null,
      this.VendorProfile ? { model: this.VendorProfile, as: 'vendorProfile', required: false } : null
    ].filter(Boolean);
  }

  getTypeWhere(type, Op) {
    if (!type || type === 'employee') {
      return { [Op.in]: ['employee', 'admin', 'manager'] };
    }
    if (type === 'customer' || type === 'vendor') return type;
    if (type === 'all') return null;
    return { [Op.in]: ['employee', 'admin', 'manager'] };
  }

  async getUsersWithRoles(filters = {}) {
    const Op = this.model.sequelize.Sequelize.Op;
    const where = {};
    const typeWhere = this.getTypeWhere(filters.type, Op);
    const search = String(filters.search || '').trim();

    if (typeWhere) where.type = typeWhere;
    if (filters.status === 'true' || filters.status === true) where.status = true;
    if (filters.status === 'false' || filters.status === false) where.status = false;
    if (filters.role_id) where.role_id = filters.role_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } },
        { '$customerProfile.phone$': { [Op.iLike]: `%${search}%` } },
        { '$customerProfile.city$': { [Op.iLike]: `%${search}%` } },
        { '$vendorProfile.business_name$': { [Op.iLike]: `%${search}%` } },
        { '$vendorProfile.legal_name$': { [Op.iLike]: `%${search}%` } },
        { '$vendorProfile.email$': { [Op.iLike]: `%${search}%` } },
        { '$vendorProfile.phone$': { [Op.iLike]: `%${search}%` } },
        { '$vendorProfile.city$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    return this.model.findAll({
      where,
      include: this.getIncludes(),
      order: [['created_at', 'DESC']]
    });
  }

  async countByType() {
    const Op = this.model.sequelize.Sequelize.Op;
    const [employee, customer, vendor, all] = await Promise.all([
      this.model.count({ where: { type: { [Op.in]: ['employee', 'admin', 'manager'] } } }),
      this.model.count({ where: { type: 'customer' } }),
      this.model.count({ where: { type: 'vendor' } }),
      this.model.count()
    ]);

    return { employee, customer, vendor, all };
  }

  async findCustomers() {
    return this.model.findAll({
      where: { type: 'customer' },
      include: [{ model: this.Role, as: 'role' }]
    });
  }

  async findEmployees() {
    return this.model.findAll({
      where: { type: 'employee', status: true },
      include: [{ model: this.Role, as: 'role' }]
    });
  }

  async findEmployeesForSelection() {
    return this.model.findAll({
      attributes: ['id', 'name'],
      where: { type: 'employee', status: true },
      order: [['name', 'ASC']]
    });
  }

  async getNextRoundRobinAssignee(Lead) {
    const employees = await this.findEmployees();
    if (employees.length === 0) return null;

    // Count active leads per employee
    const counts = {};
    for (const emp of employees) {
      const count = await Lead.count({ where: { assigned_to: emp.id, status: 'active' } });
      counts[emp.id] = count;
    }

    // Pick the employee with the fewest active leads
    let minCount = Infinity;
    let selectedEmployee = null;
    for (const emp of employees) {
      if (counts[emp.id] < minCount) {
        minCount = counts[emp.id];
        selectedEmployee = emp;
      }
    }

    return selectedEmployee;
  }
}

module.exports = UserRepository;
