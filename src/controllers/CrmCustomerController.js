class CrmCustomerController {
  constructor(userService) {
    this.userService = userService;
  }

  async index(req, res) {
    try {
      const customers = await this.userService.getCustomers();
      res.render('customer/index', { customers, title: 'Customer Management' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
}

module.exports = CrmCustomerController;
