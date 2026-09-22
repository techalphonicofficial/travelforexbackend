const paymentGatewayConfigService = require('../services/paymentGatewayConfig.service');

class PaymentGatewayConfigController {

    // GET /admin/payment-gateways
    async index(req, res) {
        try {
            const configs = await paymentGatewayConfigService.getAll();

            return res.render('admin/payment-gateways/index', {
                configs,
                success: req.query.success || null,
                error: req.query.error || null
            });

        } catch (error) {
            console.error(
                'Payment Gateway Config - Index Error:',
                error
            );

            return res.render('admin/payment-gateways/index', {
                configs: [],
                success: null,
                error: error.message || 'Unable to load payment gateway configurations'
            });
        }
    }

    // POST /admin/payment-gateways
    async create(req, res) {
        try {
            await paymentGatewayConfigService.create(req.body);

            return res.redirect(
                '/admin/payment-gateways?success=Payment gateway configuration created successfully'
            );

        } catch (error) {
            console.error(
                'Payment Gateway Config - Create Error:',
                error
            );

            return res.redirect(
                `/admin/payment-gateways?error=${encodeURIComponent(
                    error.message || 'Unable to create payment gateway configuration'
                )}`
            );
        }
    }

    // POST /admin/payment-gateways/:id/update
    async update(req, res) {
        try {
            const { id } = req.params;

            await paymentGatewayConfigService.update(
                id,
                req.body
            );

            return res.redirect(
                '/admin/payment-gateways?success=Payment gateway configuration updated successfully'
            );

        } catch (error) {
            console.error(
                'Payment Gateway Config - Update Error:',
                error
            );

            return res.redirect(
                `/admin/payment-gateways?error=${encodeURIComponent(
                    error.message || 'Unable to update payment gateway configuration'
                )}`
            );
        }
    }

    // POST /admin/payment-gateways/:id/delete
    async delete(req, res) {
        try {
            const { id } = req.params;

            await paymentGatewayConfigService.delete(id);

            return res.redirect(
                '/admin/payment-gateways?success=Payment gateway configuration deleted successfully'
            );

        } catch (error) {
            console.error(
                'Payment Gateway Config - Delete Error:',
                error
            );

            return res.redirect(
                `/admin/payment-gateways?error=${encodeURIComponent(
                    error.message || 'Unable to delete payment gateway configuration'
                )}`
            );
        }
    }

    // POST /admin/payment-gateways/:id/toggle
    async toggle(req, res) {
        try {
            const { id } = req.params;

            const isActive =
                req.body.is_active === 'true' ||
                req.body.is_active === true ||
                req.body.is_active === '1' ||
                req.body.is_active === 1;

            await paymentGatewayConfigService.setActive(
                id,
                isActive
            );

            return res.redirect(
                '/admin/payment-gateways?success=Payment gateway status updated successfully'
            );

        } catch (error) {
            console.error(
                'Payment Gateway Config - Toggle Error:',
                error
            );

            return res.redirect(
                `/admin/payment-gateways?error=${encodeURIComponent(
                    error.message || 'Unable to update payment gateway status'
                )}`
            );
        }
    }
}

module.exports = new PaymentGatewayConfigController();