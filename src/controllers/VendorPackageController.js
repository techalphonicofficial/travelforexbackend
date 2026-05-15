const path = require('path');
const fs = require('fs');

class VendorPackageController {
    constructor(vendorService, packageRepo, destinationRepo, categoryRepo, activityRepo, db, models) {
        this.vendorService = vendorService;
        this.packageRepo = packageRepo;
        this.destinationRepo = destinationRepo;
        this.categoryRepo = categoryRepo;
        this.activityRepo = activityRepo;
        this.db = db;
        this.models = models;
    }

    async index(req, res) {
        try {
            const vendorId = req.session.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            
            const result = await this.vendorService.getVendorPackages(vendorId, page, limit);

            res.render('vendor/packages/index', {
                title: 'My Packages',
                packages: result.rows,
                total: result.count,
                currentPage: page,
                totalPages: Math.ceil(result.count / limit),
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Packages Index Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async create(req, res) {
        try {
            const destinations = await this.models.Destination.findAll({ order: [['name', 'ASC']] });
            const categories = await this.categoryRepo.findAll();
            const activities = await this.models.Activity.findAll({ order: [['name', 'ASC']] });

            res.render('vendor/packages/form', {
                title: 'Create Package',
                pkg: null,
                destinations,
                categories,
                activities,
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Packages Create Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async edit(req, res) {
        try {
            const vendorId = req.session.user.id;
            const pkg = await this.models.Package.findOne({
                where: { id: req.params.id, vendor_id: vendorId },
                include: [
                    {
                        model: this.models.PackageDestination,
                        as: 'destinations',
                        include: [{ model: this.models.Destination, as: 'destination' }]
                    },
                    { model: this.models.PackageInclusion, as: 'inclusions' },
                    { model: this.models.PackageExclusion, as: 'exclusions' },
                    { model: this.models.Media, as: 'gallery' }
                ],
                order: [[{ model: this.models.PackageDestination, as: 'destinations' }, 'order', 'ASC']]
            });

            if (!pkg) return res.status(404).send('Package not found or unauthorized');

            const plainPkg = pkg.get({ plain: true });

            // Transform for frontend form
            plainPkg.stays = plainPkg.destinations.map(pd => ({
                destinationId: pd.destination ? pd.destination.id : null,
                destinationName: pd.destination ? pd.destination.name : 'Unknown',
                nights: pd.nights,
                activities: pd.activities || {}
            })).filter(s => s.destinationId !== null);

            const destinations = await this.models.Destination.findAll({ order: [['name', 'ASC']] });
            const activities = await this.models.Activity.findAll({ order: [['name', 'ASC']] });
            const categories = await this.categoryRepo.findAll();

            res.render('vendor/packages/form', {
                title: `Edit: ${plainPkg.name}`,
                pkg: plainPkg,
                destinations,
                categories,
                activities,
                user: req.session.user,
                layout: 'layouts/vendor_layout'
            });
        } catch (error) {
            console.error('Packages Edit Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async save(req, res) {
        const { id, name, duration, price, description, destinations, inclusions, exclusions } = req.body;
        const vendorId = req.session.user.id;

        try {
            const transaction = await this.db.transaction();

            try {
                let pkg;
                const packageData = {
                    name,
                    duration_days: duration,
                    price: price || 0,
                    description: description || '',
                    vendor_id: vendorId,
                    status: false // Always inactive by default for vendor
                };

                if (id) {
                    // Update existing package
                    pkg = await this.models.Package.findOne({ where: { id, vendor_id: vendorId } });
                    if (!pkg) throw new Error('Package not found or unauthorized');
                    
                    await pkg.update(packageData, { transaction });

                    // Clean up relations
                    await this.models.PackageDestination.destroy({ where: { package_id: id }, transaction });
                    await this.models.PackageInclusion.destroy({ where: { package_id: id }, transaction });
                    await this.models.PackageExclusion.destroy({ where: { package_id: id }, transaction });
                } else {
                    // Create new Package
                    pkg = await this.models.Package.create(packageData, { transaction });
                }

                // Save Destinations
                if (destinations && destinations.length) {
                    for (let i = 0; i < destinations.length; i++) {
                        const dest = destinations[i];
                        await this.models.PackageDestination.create({
                            package_id: pkg.id,
                            destination_id: dest.destinationId,
                            nights: dest.nights,
                            order: i + 1,
                            activities: dest.activities || {}
                        }, { transaction });
                    }
                }

                // Inclusions
                if (inclusions && inclusions.length) {
                    await this.models.PackageInclusion.bulkCreate(
                        inclusions.map(text => ({ package_id: pkg.id, text })),
                        { transaction }
                    );
                }

                // Exclusions
                if (exclusions && exclusions.length) {
                    await this.models.PackageExclusion.bulkCreate(
                        exclusions.map(text => ({ package_id: pkg.id, text })),
                        { transaction }
                    );
                }

                await transaction.commit();
                res.json({
                    success: true,
                    message: id ? 'Package updated and pending admin approval!' : 'Package created and pending admin approval!',
                    id: pkg.id
                });

            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Package Save Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const vendorId = req.session.user.id;
            const pkg = await this.models.Package.findOne({ where: { id: req.params.id, vendor_id: vendorId } });
            
            if (!pkg) return res.status(404).json({ success: false, message: 'Package not found or unauthorized' });

            await pkg.destroy();
            res.json({ success: true, message: 'Package deleted successfully' });
        } catch (error) {
            console.error('Package Delete Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async uploadMedia(req, res) {
        try {
            const vendorId = req.session.user.id;
            const pkg = await this.models.Package.findOne({ where: { id: req.params.id, vendor_id: vendorId } });
            
            if (!pkg) return res.status(404).json({ success: false, message: 'Package not found or unauthorized' });
            if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

            const isVideo = req.file.mimetype.startsWith('video/');
            const media = await this.models.Media.create({
                entity_type: 'package',
                entity_id: req.params.id,
                url: `/uploads/packages/${req.file.filename}`,
                media_type: isVideo ? 'video' : 'image'
            });

            res.json({ success: true, media });
        } catch (error) {
            console.error('Media Upload Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteMedia(req, res) {
        try {
            const vendorId = req.session.user.id;
            const pkg = await this.models.Package.findOne({ where: { id: req.params.id, vendor_id: vendorId } });
            
            if (!pkg) return res.status(404).json({ success: false, message: 'Package not found or unauthorized' });

            const media = await this.models.Media.findOne({ 
                where: { id: req.params.mediaId, entity_id: req.params.id, entity_type: 'package' } 
            });
            
            if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

            // Delete from filesystem
            const filePath = path.join(__dirname, '..', '..', 'public', media.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            await media.destroy();
            res.json({ success: true, message: 'Media deleted' });
        } catch (error) {
            console.error('Media Delete Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = VendorPackageController;
