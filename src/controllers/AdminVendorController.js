class AdminVendorController {
  constructor(models = {}) {
    this.VendorProfile = models.VendorProfile;
    this.User = models.User;
    this.statuses = ['pending', 'approved', 'rejected'];
  }

  getOp() {
    return this.VendorProfile.sequelize.Sequelize.Op;
  }

  buildWhere({ search = '', status = 'pending' } = {}) {
    const Op = this.getOp();
    const where = {};
    const cleanSearch = String(search || '').trim();

    if (this.statuses.includes(status)) {
      where.status = status;
    }

    if (cleanSearch) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${cleanSearch}%` } },
        { legal_name: { [Op.iLike]: `%${cleanSearch}%` } },
        { business_type: { [Op.iLike]: `%${cleanSearch}%` } },
        { email: { [Op.iLike]: `%${cleanSearch}%` } },
        { phone: { [Op.iLike]: `%${cleanSearch}%` } },
        { city: { [Op.iLike]: `%${cleanSearch}%` } },
        { state: { [Op.iLike]: `%${cleanSearch}%` } },
        { pan_number: { [Op.iLike]: `%${cleanSearch}%` } },
        { gst_number: { [Op.iLike]: `%${cleanSearch}%` } },
        { '$user.name$': { [Op.iLike]: `%${cleanSearch}%` } },
        { '$user.email$': { [Op.iLike]: `%${cleanSearch}%` } },
        { '$user.phone_number$': { [Op.iLike]: `%${cleanSearch}%` } }
      ];
    }

    return where;
  }

  getInclude() {
    return this.User
      ? [{ model: this.User, as: 'user', required: false, attributes: ['id', 'name', 'email', 'phone_number', 'status', 'created_at'] }]
      : [];
  }

  async getStatusCounts() {
    const [pending, approved, rejected, all] = await Promise.all([
      this.VendorProfile.count({ where: { status: 'pending' } }),
      this.VendorProfile.count({ where: { status: 'approved' } }),
      this.VendorProfile.count({ where: { status: 'rejected' } }),
      this.VendorProfile.count()
    ]);

    return { pending, approved, rejected, all };
  }

  async requests(req, res) {
    try {
      if (!this.VendorProfile) return res.status(500).send('Vendor profile model is not configured');

      const status = this.statuses.includes(req.query.status) ? req.query.status : (req.query.status === 'all' ? 'all' : 'pending');
      const filters = {
        status,
        search: String(req.query.search || '').trim()
      };

      const [requests, statusCounts] = await Promise.all([
        this.VendorProfile.findAll({
          where: this.buildWhere(filters),
          include: this.getInclude(),
          order: [['created_at', 'DESC']]
        }),
        this.getStatusCounts()
      ]);

      res.render('admin/vendors/requests', {
        title: 'Vendor Requests',
        requests: requests.map(row => row.get ? row.get({ plain: true }) : row),
        filters,
        statusCounts,
        success: req.query.success || '',
        user: req.session.user
      });
    } catch (error) {
      console.error('Admin vendor requests error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async setStatus(req, res, status) {
    try {
      if (!this.VendorProfile) return res.status(500).send('Vendor profile model is not configured');

      const profile = await this.VendorProfile.findByPk(req.params.id, { include: this.getInclude() });
      if (!profile) return res.status(404).send('Vendor request not found');

      const now = new Date();
      const currentMetadata = profile.metadata && typeof profile.metadata === 'object' ? profile.metadata : {};
      const metadata = {
        ...currentMetadata,
        [`${status}_by`]: req.session.user ? req.session.user.id : null,
        [`${status}_at`]: now.toISOString()
      };

      await profile.update({
        status,
        approved_at: status === 'approved' ? now : null,
        metadata
      });

      if (profile.user && typeof profile.user.update === 'function') {
        await profile.user.update({ status: status === 'approved' });
      }

      res.redirect(`/admin/vendors/requests?status=${status}&success=${status}`);
    } catch (error) {
      console.error(`Admin vendor ${status} error:`, error);
      res.status(500).send('Internal Server Error');
    }
  }

  async approve(req, res) {
    return this.setStatus(req, res, 'approved');
  }

  async reject(req, res) {
    return this.setStatus(req, res, 'rejected');
  }
}

module.exports = AdminVendorController;
