const BaseRepository = require('./BaseRepository');

class AppSettingRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async findByKey(key) {
        return this.model.findOne({ where: { key } });
    }

    async upsert(key, value) {
        const [setting, created] = await this.model.findOrCreate({
            where: { key },
            defaults: { key, value }
        });
        if (!created) await setting.update({ value });
        return setting;
    }

    async get(key) {
        const setting = await this.findByKey(key);
        return setting ? setting.value : null;
    }

    async set(key, value) {
        return this.upsert(key, value);
    }
}

module.exports = AppSettingRepository;
