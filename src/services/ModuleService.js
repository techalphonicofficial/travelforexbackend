class ModuleService {
  constructor(moduleRepo) {
    this.moduleRepo = moduleRepo;
  }

  async getAllModules() {
    return this.moduleRepo.findAll();
  }

  async getModuleById(id) {
    return this.moduleRepo.findById(id);
  }

  async createModule(data) {
    return this.moduleRepo.create(data);
  }

  async updateModule(id, data) {
    return this.moduleRepo.update(id, data);
  }

  async deleteModule(id) {
    return this.moduleRepo.delete(id);
  }
}

module.exports = ModuleService;
