const PaymentGatewayConfig = require('../models/PaymentGatewayConfig');

class PaymentGatewayConfigService {

    /**
     * Create a new payment gateway configuration
     */
    async create(data) {
        const {
            gateway,
            environment,
            base_url,
            merchant_id,
            aggregator_id,
            secure_key,
            initiate_sale_url,
            redirect_url,
            currency,
            is_active
        } = data;

        if (
            !gateway ||
            !environment ||
            !base_url ||
            !merchant_id ||
            !aggregator_id ||
            !secure_key
        ) {
            throw new Error(
                'gateway, environment, base_url, merchant_id, aggregator_id and secure_key are required'
            );
        }

        const config = await PaymentGatewayConfig.create({
            gateway,
            environment,
            base_url,
            merchant_id,
            aggregator_id,
            secure_key,
            initiate_sale_url,
            redirect_url,
            currency: currency || 'INR',
            is_active: is_active !== undefined ? is_active : true
        });

        return config;
    }

    /**
     * Get active gateway configuration
     */
    async getActiveGateway(gateway, environment = 'UAT') {
        const config = await PaymentGatewayConfig.findOne({
            where: {
                gateway,
                environment,
                is_active: true
            }
        });

        if (!config) {
            throw new Error(
                `Active payment gateway configuration not found for ${gateway} - ${environment}`
            );
        }

        return config;
    }

    /**
     * Get configuration by ID
     */
    async getById(id) {
        const config = await PaymentGatewayConfig.findByPk(id);

        if (!config) {
            throw new Error('Payment gateway configuration not found');
        }

        return config;
    }

    /**
     * Update gateway configuration
     */
    async update(id, data) {
        const config = await this.getById(id);

        const updateData = {
            ...data
        };

        // Empty secure key means:
        // keep existing secure key
        if (
            updateData.secure_key === undefined ||
            updateData.secure_key === null ||
            updateData.secure_key.trim() === ''
        ) {
            delete updateData.secure_key;
        }

        await config.update(updateData);

        return config;
    }
    /**
     * Activate / deactivate gateway configuration
     */
    async setActive(id, isActive) {
        const config = await this.getById(id);

        await config.update({
            is_active: isActive
        });

        return config;
    }

    /**
     * Get all gateway configurations
     */
    async getAll() {
        return await PaymentGatewayConfig.findAll({
            order: [['created_at', 'DESC']]
        });
    }


    /**
 * Delete gateway configuration
 */
    async delete(id) {
        const config = await this.getById(id);

        await config.destroy();

        return true;
    }
}

module.exports = new PaymentGatewayConfigService();