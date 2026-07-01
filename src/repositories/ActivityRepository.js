const BaseRepository = require('./BaseRepository');

class ActivityRepository extends BaseRepository {
    constructor(model, destinationModel) {
        super(model);
        this.destinationModel = destinationModel;
    }

    async findAll() {
        return this.model.findAll({
            include: [{ model: this.destinationModel, as: 'destination', attributes: ['id', 'name'] }]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: [{ model: this.destinationModel, as: 'destination', attributes: ['id', 'name'] }]
        });
    }

    async findByDestinationId(destId) {
        return this.model.findAll({
            where: { destination_id: destId },
            include: [{ model: this.destinationModel, as: 'destination', attributes: ['id', 'name'] }]
        });
    }
}

module.exports = ActivityRepository;
