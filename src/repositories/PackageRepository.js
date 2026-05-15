const BaseRepository = require('./BaseRepository');
const { Op } = require('sequelize');

class PackageRepository extends BaseRepository {
    constructor(model, destinationModel, activityModel, mediaModel, inclusionModel, exclusionModel, packageDestinationModel) {
        super(model);
        this.destinationModel = destinationModel;
        this.activityModel = activityModel;
        this.mediaModel = mediaModel;
        this.inclusionModel = inclusionModel;
        this.exclusionModel = exclusionModel;
        this.packageDestinationModel = packageDestinationModel;
    }

    async findAll() {
        return this.model.findAll({
            include: [
                { 
                    model: this.packageDestinationModel, as: 'destinations',
                    include: [{ model: this.destinationModel, as: 'destination' }]
                },
                { model: this.mediaModel, as: 'gallery' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return this.model.findByPk(id, {
            include: [
                {
                    model: this.packageDestinationModel, as: 'destinations',
                    include: [
                        { model: this.destinationModel, as: 'destination' }
                    ]
                },
                { model: this.inclusionModel, as: 'inclusions' },
                { model: this.exclusionModel, as: 'exclusions' },
                { model: this.mediaModel, as: 'gallery' }
            ],
            order: [
                [{ model: this.packageDestinationModel, as: 'destinations' }, 'order', 'ASC']
            ]
        });
    }

    async delete(id) {
        const pkg = await this.model.findByPk(id);
        if (!pkg) return null;

        // Cascade delete is handled by DB 'ON DELETE CASCADE' for the most part,
        // but we manually cleanup media gallery which is polymorphic.
        if (this.mediaModel) {
            await this.mediaModel.destroy({ where: { entity_id: id, entity_type: 'package' } });
            
            // For day-level media, it's more complex since we need day IDs.
            // However, the migration doesn't strictly define Day IDs for media yet in this overhaul.
            // If needed, we could fetch all destinations -> days -> dayIds and destroy media.
        }

        return pkg.destroy();
    }

    async findByDestinationSlug(slug) {
        return this.model.findAll({
            include: [
                {
                    model: this.packageDestinationModel,
                    as: 'destinations',
                    required: true,
                    include: [{ 
                        model: this.destinationModel, 
                        as: 'destination',
                        where: { slug: slug },
                        required: true
                    }]
                },
                { model: this.mediaModel, as: 'gallery' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
}

module.exports = PackageRepository;
