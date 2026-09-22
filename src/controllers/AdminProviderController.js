class AdminProviderController {
    constructor(models = {}) {
        this.ProviderConfig = models.ProviderConfig;
    }

    async index(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const providers = await this.ProviderConfig.findAll({
                order: [['created_at', 'DESC']]
            });

            return res.render('admin/providers/index', {
                title: 'API Providers',
                providers: providers.map((row) =>
                    row.get
                        ? row.get({ plain: true })
                        : row
                ),
                success: req.query.success || '',
                error: req.query.error || '',
                user: req.session.user
            });

        } catch (error) {
            console.error(
                'Admin provider index error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async create(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const {
                provider_name,
                api_key,
                hotel_url,
                flight_url,
                environment
            } = req.body;

            if (
                !provider_name ||
                !api_key ||
                !hotel_url ||
                !flight_url ||
                !environment
            ) {
                return res
                    .status(400)
                    .send('All fields are required');
            }

            if (
                !['TEST', 'PRODUCTION'].includes(
                    String(environment).toUpperCase()
                )
            ) {
                return res
                    .status(400)
                    .send('Invalid environment');
            }

            const now = new Date();

            await this.ProviderConfig.create({
                provider_name: provider_name.trim(),
                api_key: api_key.trim(),
                hotel_url: hotel_url.trim(),
                flight_url: flight_url.trim(),
                environment:
                    String(environment).toUpperCase(),
                created_at: now,
                updated_at: now
            });

            return res.redirect(
                '/admin/providers?success=Provider created successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider create error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async update(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const provider =
                await this.ProviderConfig.findByPk(
                    req.params.id
                );

            if (!provider) {
                return res
                    .status(404)
                    .send('Provider configuration not found');
            }

            const {
                provider_name,
                api_key,
                hotel_url,
                flight_url,
                environment
            } = req.body;

            if (
                !provider_name ||
                !hotel_url ||
                !flight_url ||
                !environment
            ) {
                return res
                    .status(400)
                    .send('Required fields are missing');
            }

            if (
                !['TEST', 'PRODUCTION'].includes(
                    String(environment).toUpperCase()
                )
            ) {
                return res
                    .status(400)
                    .send('Invalid environment');
            }

            const updateData = {
                provider_name: provider_name.trim(),
                hotel_url: hotel_url.trim(),
                flight_url: flight_url.trim(),
                environment:
                    String(environment).toUpperCase(),
                updated_at: new Date()
            };

            // API key only update when a new key is provided
            if (api_key && api_key.trim()) {
                updateData.api_key = api_key.trim();
            }

            await provider.update(updateData);

            return res.redirect(
                '/admin/providers?success=Provider updated successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider update error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }

    async delete(req, res) {
        try {
            if (!this.ProviderConfig) {
                return res
                    .status(500)
                    .send('Provider config model is not configured');
            }

            const provider =
                await this.ProviderConfig.findByPk(
                    req.params.id
                );

            if (!provider) {
                return res
                    .status(404)
                    .send('Provider configuration not found');
            }

            await provider.destroy();

            return res.redirect(
                '/admin/providers?success=Provider deleted successfully'
            );

        } catch (error) {
            console.error(
                'Admin provider delete error:',
                error
            );

            return res
                .status(500)
                .send('Internal Server Error');
        }
    }
}

module.exports = AdminProviderController;