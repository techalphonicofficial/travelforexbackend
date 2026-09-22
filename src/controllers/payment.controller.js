const iciciPaymentService = require('../services/iciciPayment.service');

class PaymentController {

    /**
     * @swagger
     * /api/v1/payments/initiate:
     *   post:
     *     summary: Initiate payment
     *     description: Creates a pending payment and initiates the configured payment gateway.
     *     tags:
     *       - Payments
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - amount
     *             properties:
     *               userId:
     *                 type: integer
     *                 example: 101
     *               bookingId:
     *                 type: integer
     *                 nullable: true
     *                 example: 25
     *               customTripId:
     *                 type: integer
     *                 nullable: true
     *                 example: 10
     *               amount:
     *                 type: number
     *                 format: double
     *                 example: 1500.00
     *               environment:
     *                 type: string
     *                 enum:
     *                   - UAT
     *                   - PRODUCTION
     *                 example: UAT
     *               requestData:
     *                 type: object
     *                 description: Additional gateway-specific parameters.
     *                 additionalProperties: true
     *                 example:
     *                   customerName: Ravi Maurya
     *                   customerEmail: ravi@example.com
     *                   customerMobile: "9876543210"
     *     responses:
     *       200:
     *         description: Payment initiation successful
     *       400:
     *         description: Invalid payment request
     *       500:
     *         description: Payment initiation failed
     */
    async initiate(req, res) {
        try {

            const {
                userId,
                bookingId = null,
                customTripId = null,
                amount,
                environment = 'UAT',
                requestData = {}
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId is required'
                });
            }

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'amount is required'
                });
            }

            const result =
                await iciciPaymentService.initiateSale({
                    userId,
                    bookingId,
                    customTripId,
                    amount,
                    environment,
                    requestData
                });

            return res.status(200).json({
                success: true,
                message: 'Payment initiated successfully',
                data: result
            });

        } catch (error) {

            console.error(
                'Payment Initiate Controller Error:',
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    'Unable to initiate payment'
            });
        }
    }


    /**
 * ICICI Payment Advice / Callback
 */
    async iciciPaymentAdvice(req, res) {

        try {

            const result =
                await iciciPaymentService.handlePaymentAdvice(
                    req.body
                );

            return res.status(200).json({
                success: true,
                message: 'Payment advice processed successfully',
                data: result
            });

        } catch (error) {

            console.error(
                'ICICI Payment Advice Error:',
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    'Unable to process payment advice'
            });
        }
    }
}

module.exports = new PaymentController();