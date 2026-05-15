class MediaRepository {
    constructor(Media) {
        this.Media = Media;
    }

    async create(data) {
        return await this.Media.create(data);
    }

    async findByEntity(entityType, entityId) {
        return await this.Media.findAll({
            where: { entity_type: entityType, entity_id: entityId },
            order: [['is_primary', 'DESC'], ['id', 'ASC']]
        });
    }

    async deleteByEntity(entityType, entityId) {
        return await this.Media.destroy({
            where: { entity_type: entityType, entity_id: entityId }
        });
    }

    async updatePrimary(entityType, entityId, mediaId) {
        await this.Media.update({ is_primary: false }, {
            where: { entity_type: entityType, entity_id: entityId }
        });
        return await this.Media.update({ is_primary: true }, {
            where: { id: mediaId }
        });
    }
}

module.exports = MediaRepository;
