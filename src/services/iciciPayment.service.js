const axios = require('axios');

const Payment = require('../models/Payment');
const paymentGatewayConfigService = require('./paymentGatewayConfig.service');
const { createSecureHash } = require('../utils/iciciHash');

class IciciPaymentService {


    generateTxnDate() {
    const now = new Date();

    const pad = (value) =>
        String(value).padStart(2, '0');

    return (
        now.getFullYear() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds())
    );
}

    /**
     * Get active ICICI gateway configuration
     */
    async getGatewayConfig(environment = 'UAT') {
        return await paymentGatewayConfigService.getActiveGateway(
            'ICICI_ORANGE_PG',
            environment
        );
    }


    /**
     * Generate unique merchant transaction number
     */
    generateMerchantTxnNo() {
        const timestamp = Date.now();

        const random = Math.floor(
            1000 + Math.random() * 9000
        );

        return `TXN${timestamp}${random}`;
    }


    /**
     * Build Initiate Sale URL
     */
    buildInitiateSaleUrl(config) {

        if (!config.base_url) {
            throw new Error('ICICI base URL is not configured');
        }

        if (!config.initiate_sale_url) {
            throw new Error(
                'ICICI Initiate Sale URL is not configured'
            );
        }

        return `${config.base_url.replace(/\/+$/, '')}/${config.initiate_sale_url.replace(/^\/+/, '')}`;
    }


    /**
     * Create ICICI Initiate Sale request
     *
     * payload should contain the ICICI required parameters.
     */
    async initiateSale({
        userId,
        bookingId = null,
        customTripId = null,
        amount,
        environment = 'UAT',
        requestData = {}
    }) {

        if (!userId) {
            throw new Error('userId is required');
        }

        if (!amount) {
            throw new Error('Payment amount is required');
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            throw new Error('Invalid payment amount');
        }


        /*
         * 1. Get gateway configuration dynamically
         */

        const config = await this.getGatewayConfig(environment);


        /*
         * 2. Generate our merchant transaction number
         */

        const merchantTxnNo =
            this.generateMerchantTxnNo();


        /*
         * 3. Create Payment record BEFORE calling ICICI
         *
         * Status remains pending until payment is verified.
         */

        const payment = await Payment.create({
            custom_trip_id: customTripId,
            booking_id: bookingId,
            user_id: userId,
            amount: numericAmount,
            currency: config.currency || 'INR',
            gateway: 'ICICI_ORANGE_PG',
            merchant_txn_no: merchantTxnNo,
            status: 'pending'
        });


        try {

            /*
             * 4. Build ICICI request payload
             *
             * requestData comes from booking/payment API.
             *
             * We keep gateway credentials dynamic.
             */

            const payload = {
                merchantId: config.merchant_id,
                aggregatorID: config.aggregator_id,
                merchantTxnNo,
                amount: numericAmount.toFixed(2),
                currencyCode: '356',

                payType: '0',
                customerEmailID: requestData.customerEmailID || 'test@travel-forex.com',
                transactionType: 'SALE',

                returnURL:
                    requestData.returnURL ||
                    'https://travel-forex.com/payment/callback',

                txnDate:
                    requestData.txnDate ||
                    this.generateTxnDate(),

                customerMobileNo:
                    requestData.customerMobileNo ||
                    '919999999999',

                customerName:
                    requestData.customerName ||
                    'Test User',

                addlParam1: requestData.addlParam1 || '000',
                addlParam2: requestData.addlParam2 || '111'
            };


            /*
             * 5. Generate ICICI secure hash
             */

            payload.secureHash = createSecureHash(
                payload,
                config.secure_key
            );


            /*
             * 6. Build API URL
             */

            const initiateSaleUrl =
                this.buildInitiateSaleUrl(config);


            /*
             * 7. Call ICICI Initiate Sale API
             */

            const response = await axios.post(
                initiateSaleUrl,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );


            /*
             * 8. Store ICICI response
             */

            const gatewayResponse =
                response.data || {};


            /*
             * 9. Save important ICICI metadata
             */

            await payment.update({
                tran_ctx: gatewayResponse.tranCtx || null,

                payment_data: {
                    request: {
                        ...payload,
                        secureHash: undefined
                    },

                    initiate_sale_url: initiateSaleUrl,

                    response: gatewayResponse
                },

                gateway_response: gatewayResponse
            });


            /*
             * 10. Return payment + gateway response
             */

            return {
                success: true,

                paymentId: payment.id,

                merchantTxnNo,

                status: payment.status,

                gateway: 'ICICI_ORANGE_PG',

                response: gatewayResponse
            };

        } catch (error) {

            /*
             * ICICI API failure
             */

            const errorResponse =
                error.response?.data || null;


            await payment.update({

                status: 'failed',

                gateway_response: errorResponse || {
                    message: error.message
                }

            });


            console.error(
                'ICICI Initiate Sale Error:',
                errorResponse || error.message
            );


            throw new Error(
                errorResponse?.message ||
                error.message ||
                'Unable to initiate ICICI payment'
            );
        }
    }


    /**
 * Find payment using ICICI merchant transaction number
 */
    async findPaymentByMerchantTxnNo(merchantTxnNo) {
        if (!merchantTxnNo) {
            throw new Error('merchantTxnNo is required');
        }

        const payment = await Payment.findOne({
            where: {
                merchant_txn_no: merchantTxnNo
            }
        });

        if (!payment) {
            throw new Error(
                `Payment not found for merchantTxnNo: ${merchantTxnNo}`
            );
        }

        return payment;
    }


    /**
     * Verify ICICI payment advice / callback
     */
    async handlePaymentAdvice(callbackData) {

        if (!callbackData || typeof callbackData !== 'object') {
            throw new Error('Invalid payment callback data');
        }

        /*
         * ICICI transaction number
         */
        const merchantTxnNo =
            callbackData.merchantTxnNo ||
            callbackData.merchantTransactionNo;

        if (!merchantTxnNo) {
            throw new Error(
                'merchantTxnNo is missing from payment callback'
            );
        }


        /*
         * Find our payment
         */
        const payment =
            await this.findPaymentByMerchantTxnNo(
                merchantTxnNo
            );


        /*
         * Get gateway configuration
         *
         * We use the payment gateway stored on the payment.
         */
        const environment =
            callbackData.environment || 'UAT';

        const config =
            await this.getGatewayConfig(environment);


        /*
         * 1. Verify merchant ID
         */
        if (
            callbackData.merchantId &&
            String(callbackData.merchantId) !==
            String(config.merchant_id)
        ) {
            throw new Error('Invalid merchantId in payment callback');
        }


        /*
         * 2. Verify aggregator ID
         */
        if (
            callbackData.aggregatorID &&
            String(callbackData.aggregatorID) !==
            String(config.aggregator_id)
        ) {
            throw new Error(
                'Invalid aggregatorID in payment callback'
            );
        }


        /*
         * 3. Verify amount
         *
         * Never trust the amount coming from callback alone.
         * Compare it with our Payment record.
         */
        if (callbackData.amount !== undefined) {

            const callbackAmount =
                Number(callbackData.amount);

            const paymentAmount =
                Number(payment.amount);

            if (
                !Number.isFinite(callbackAmount) ||
                callbackAmount !== paymentAmount
            ) {
                throw new Error(
                    'Payment amount mismatch'
                );
            }
        }


        /*
         * 4. Verify transaction context if callback contains it
         */
        if (
            callbackData.tranCtx &&
            payment.tran_ctx &&
            String(callbackData.tranCtx) !==
            String(payment.tran_ctx)
        ) {
            throw new Error(
                'Invalid tranCtx in payment callback'
            );
        }


        /*
         * 5. Verify ICICI secure hash
         */
        const receivedSecureHash =
            callbackData.secureHash;

        if (!receivedSecureHash) {
            throw new Error(
                'secureHash is missing from payment callback'
            );
        }


        const dataForHash = {
            ...callbackData
        };

        delete dataForHash.secureHash;


        const calculatedSecureHash =
            createSecureHash(
                dataForHash,
                config.secure_key
            );


        if (
            String(receivedSecureHash).toLowerCase() !==
            String(calculatedSecureHash).toLowerCase()
        ) {
            throw new Error(
                'Invalid secureHash in payment callback'
            );
        }


        /*
         * 6. Determine payment status
         *
         * Keep this mapping based on the actual ICICI
         * response/payment-advice status values.
         */
        const responseCode =
            callbackData.responseCode;

        const transactionStatus =
            String(
                callbackData.status ||
                callbackData.transactionStatus ||
                ''
            ).toLowerCase();


        const isSuccess =
            responseCode === 'R1000' ||
            transactionStatus === 'success' ||
            transactionStatus === 'successful';


        /*
         * 7. Idempotency
         *
         * If callback comes again after successful payment,
         * don't process it again.
         */
        if (payment.status === 'success') {

            return {
                success: true,
                alreadyProcessed: true,
                paymentId: payment.id,
                merchantTxnNo: payment.merchant_txn_no,
                status: payment.status
            };
        }


        /*
         * 8. Update payment
         */
        if (isSuccess) {

            await payment.update({

                status: 'success',

                transaction_id:
                    callbackData.transactionId ||
                    callbackData.txnId ||
                    payment.transaction_id ||
                    null,

                tran_ctx:
                    callbackData.tranCtx ||
                    payment.tran_ctx ||
                    null,

                gateway_response:
                    callbackData,

                paid_at: new Date()

            });

        } else {

            await payment.update({

                status: 'failed',

                transaction_id:
                    callbackData.transactionId ||
                    callbackData.txnId ||
                    payment.transaction_id ||
                    null,

                tran_ctx:
                    callbackData.tranCtx ||
                    payment.tran_ctx ||
                    null,

                gateway_response:
                    callbackData

            });
        }


        return {
            success: true,
            alreadyProcessed: false,
            paymentId: payment.id,
            merchantTxnNo: payment.merchant_txn_no,
            status: payment.status
        };
    }
}


module.exports = new IciciPaymentService();