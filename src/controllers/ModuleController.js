class ModuleController {
  constructor(moduleService) {
    this.moduleService = moduleService;
  }

  async index(req, res) {
    try {
      const modules = await this.moduleService.getAllModules();
      res.render('modules/index', { modules, title: 'Module Management' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async createForm(req, res) {
    try {
      res.render('modules/create', { title: 'Create New Module' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async store(req, res) {
    try {
      await this.moduleService.createModule(req.body);
      res.redirect('/modules');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async editForm(req, res) {
    try {
      const module = await this.moduleService.getModuleById(req.params.id);
      res.render('modules/edit', { module, title: 'Edit Module' });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async update(req, res) {
    try {
      await this.moduleService.updateModule(req.params.id, req.body);
      res.redirect('/modules');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async delete(req, res) {
    try {
      await this.moduleService.deleteModule(req.params.id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = ModuleController;
