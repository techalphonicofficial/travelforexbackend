const express = require('express');
const router = express.Router();
const { repositories: { bookingRepo, customTripRepo, couponRepo }, controllers: { apiTripInquiryController, apiHotelBookingController, apiPackageBookingController }, middleware: { apiAuth, optionalApiAuth, apiKeyAuth } } = require('../container');

const couponResponse = (row) => couponRepo.serialize(row);
const couponListResponse = (rows = []) => rows.map(couponResponse).filter(Boolean);
const mergeCouponPayload = (coupon, data = {}) => {
    const current = couponResponse(coupon) || {};
    const merged = {
        ...current,
        ...data
    };

    if (data.applicable_package_ids === undefined && data['applicable_package_ids[]'] === undefined) {
        merged.applicable_package_ids = current.applicable_package_ids || [];
    }
    if (data.is_active === undefined) {
        merged.is_active = current.is_active !== false;
    }

    return couponRepo.normalizePayload(merged);
};
const sendCouponError = (res, error) => {
    if (error && error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    return res.status(500).json({ success: false, message: error.message });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingCoupon:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           example: SUMMER500
 *         name:
 *           type: string
 *           example: Summer Holiday Offer
 *         discount_type:
 *           type: string
 *           enum: [fixed, percent]
 *           example: fixed
 *         discount_value:
 *           type: number
 *           example: 500
 *         discount_amount:
 *           type: number
 *           example: 500
 *         booking_amount:
 *           type: number
 *           description: Original package base amount before coupon discount.
 *           example: 32000
 *         amount_after_discount:
 *           type: number
 *           example: 31500
 *     PackageBookingAmounts:
 *       type: object
 *       properties:
 *         original_package_base_amount:
 *           type: number
 *           description: Package base amount before coupon discount.
 *           example: 32000
 *         package_base_amount:
 *           type: number
 *           description: Package base amount after coupon discount.
 *           example: 31500
 *         coupon_discount_amount:
 *           type: number
 *           example: 500
 *         tax_type:
 *           type: string
 *           nullable: true
 *           example: GST
 *         tax_percent:
 *           type: number
 *           example: 5
 *         tax_amount:
 *           type: number
 *           example: 1575
 *         package_total:
 *           type: number
 *           description: Final payable package total after coupon discount and tax recalculation.
 *           example: 33075
 *         paid_amount:
 *           type: number
 *           example: 9922.5
 *         remaining_amount:
 *           type: number
 *           example: 23152.5
 *     PackageBookingResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         booking_reference:
 *           type: string
 *           example: PT-PKG-0029-MPXNXLJNV9FS
 *         package_id:
 *           type: integer
 *           example: 29
 *         package_slug:
 *           type: string
 *           example: bangkok-explorer-5n6d
 *         package_name:
 *           type: string
 *           example: Bangkok Explorer - 5N6D
 *         customer:
 *           type: object
 *           properties:
 *             name: { type: string }
 *             email: { type: string }
 *             phone: { type: string }
 *         amounts:
 *           $ref: '#/components/schemas/PackageBookingAmounts'
 *         coupon:
 *           $ref: '#/components/schemas/BookingCoupon'
 *         payment_status:
 *           type: string
 *           example: payment_verified
 *         accounting_status:
 *           type: string
 *           example: recorded
 *     PackageBookingCreateRequest:
 *       type: object
 *       required:
 *         - package_id
 *         - customer
 *       properties:
 *         package_id:
 *           type: integer
 *           example: 29
 *         package_slug:
 *           type: string
 *           example: bangkok-explorer-5n6d
 *         package_name:
 *           type: string
 *           example: Bangkok Explorer - 5N6D
 *         package_price:
 *           type: number
 *           example: 32000
 *         package_base_amount:
 *           type: number
 *           description: Amount coupon validation uses before discount.
 *           example: 32000
 *         tax_type:
 *           type: string
 *           example: GST
 *         tax_percent:
 *           type: number
 *           example: 5
 *         coupon_code:
 *           type: string
 *           description: Optional coupon/promo code. Also accepted as couponCode, promo_code, promoCode, or coupon.code.
 *           example: SUMMER500
 *         coupon:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: SUMMER500
 *         payable_now:
 *           type: number
 *           example: 9922.5
 *         customer:
 *           type: object
 *           properties:
 *             id: { type: string, format: uuid }
 *             name: { type: string, example: Akash Sharma }
 *             email: { type: string, example: akash@example.com }
 *             phone: { type: string, example: "08888888827" }
 *     Coupon:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         code: { type: string, example: SUMMER500 }
 *         name: { type: string, example: Summer Holiday Offer }
 *         description: { type: string, nullable: true }
 *         discount_type:
 *           type: string
 *           enum: [fixed, percent]
 *         discount_value: { type: number, example: 500 }
 *         max_discount_amount: { type: number, nullable: true, example: 1000 }
 *         minimum_booking_amount: { type: number, example: 10000 }
 *         valid_from: { type: string, format: date, nullable: true }
 *         valid_until: { type: string, format: date, nullable: true }
 *         usage_limit: { type: integer, nullable: true }
 *         usage_limit_per_customer: { type: integer, nullable: true }
 *         applicable_scope:
 *           type: string
 *           enum: [all, package_specific]
 *         applicable_package_ids:
 *           type: array
 *           items:
 *             type: integer
 *         is_active: { type: boolean }
 *         redemption_count: { type: integer }
 */

/**
 * @swagger
 * /api/v1/bookings/customize:
 *   get:
 *     summary: Get customize bookings for authenticated user
 *     description: Uses the Bearer JWT to read the logged-in user id, resolve the customer's records, and return their customize requests plus converted custom trips.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, quoted, converted, cancelled]
 *     responses:
 *       200:
 *         description: Authenticated user's customize bookings
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 *   post:
 *     summary: Store a customized trip request from frontend
 *     description: If a Bearer JWT is supplied, the request is linked to the authenticated user automatically.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trip
 *             properties:
 *               customer:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *               trip:
 *                 type: object
 *                 required: [destination]
 *                 properties:
 *                   destination: { type: string, example: Kerala }
 *                   destination_slug: { type: string, example: kerala }
 *                   travel_with: { type: string, example: Luxury }
 *                   duration: { type: string, example: "7-8 Days" }
 *                   departure_city: { type: string }
 *                   departure_date: { type: string }
 *                   total_travellers: { type: integer }
 *                   rooms:
 *                     type: array
 *                     items: { type: object }
 *                   cities:
 *                     type: array
 *                     items: { type: object }
 *               source: { type: string, example: customize_flow }
 *     responses:
 *       201:
 *         description: Customized booking request stored
 *       400:
 *         description: Validation error
 */

router.get('/customize', apiAuth, (req, res) => apiTripInquiryController.listForAuthenticatedUser(req, res));
router.post('/customize', optionalApiAuth, (req, res) => apiTripInquiryController.create(req, res));

/**
 * @swagger
 * /api/v1/bookings/hotel:
 *   post:
 *     summary: Create a hotel booking enquiry
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - hotel_id
 *               - room_count
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User UUID. Optional when Bearer token is supplied.
 *               hotel_id:
 *                 type: integer
 *                 description: Hotel id selected by the customer.
 *               room_count:
 *                 type: integer
 *                 example: 2
 *               rooms:
 *                 type: array
 *                 items: { type: object }
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hotel booking enquiry created
 *       400:
 *         description: Validation error
 */
router.post('/hotel', optionalApiAuth, (req, res) => apiHotelBookingController.create(req, res));

/**
 * @swagger
 * /api/v1/bookings/customer/{customer_id}:
 *   get:
 *     summary: Get package bookings by customer id
 *     description: Returns package booking history for a customer profile id, user id, or customer email. Customer tokens can only access their own bookings; admin/manager tokens can inspect any customer id.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer profile UUID, customer user UUID, or customer email
 *         example: 974cfab8-b3e9-4d1d-9a73-03c730fdba31
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Optional payment status filter
 *         example: payment_verified
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Customer package bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer_id:
 *                       type: string
 *                     customer_ids:
 *                       type: array
 *                       items:
 *                         type: string
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     totals:
 *                       type: object
 *                       properties:
 *                         package_total: { type: number }
 *                         paid_amount: { type: number }
 *                         remaining_amount: { type: number }
 *                     rows:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: customer_id is required
 *       401:
 *         description: Access token required
 *       403:
 *         description: Customer is not allowed to view another customer's bookings
 */
router.get('/customer/:customer_id', apiAuth, (req, res) => apiPackageBookingController.listByCustomer(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/customize:
 *   get:
 *     summary: Get customizable package bookings
 *     description: Returns package bookings whose related package is marked customizable, with customer and package details.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Optional customer profile UUID, user UUID, or customer email. Admin/manager can filter; customers see their own records.
 *       - in: query
 *         name: booking_id
 *         schema:
 *           type: string
 *         description: Optional booking UUID or booking reference.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Optional payment status filter.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Customizable package bookings
 */
router.get('/package/customize', apiAuth, (req, res) => apiPackageBookingController.listCustomizablePackageBookings(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/{booking_id}/pay-remaining:
 *   post:
 *     summary: Pay remaining amount for a package booking
 *     description: Records a remaining-balance payment, debits Cash/Bank, credits Accounts Receivable, and updates the package booking paid/remaining amounts.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package booking UUID or booking reference
 *         example: PT-PKG-0029-MPXNXLJNV9FS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount paid now. Defaults to full remaining amount when omitted.
 *                 example: 23520
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_remaining_123
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_remaining_123
 *               payment_verified_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Remaining amount recorded and accounting receivable settled
 *       400:
 *         description: Invalid payment amount or original accounting missing
 *       401:
 *         description: Access token required
 *       403:
 *         description: Not allowed to update this booking
 *       404:
 *         description: Package booking not found
 */
router.post('/package/:booking_id/pay-remaining', apiAuth, (req, res) => apiPackageBookingController.payRemaining(req, res));

/**
 * @swagger
 * /api/v1/bookings/cancellation-rules:
 *   get:
 *     summary: Get active package cancellation rules
 *     description: Returns active refund/cancellation percentage rules ordered by days before departure.
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Active cancellation rules
 */
router.get('/cancellation-rules', (req, res) => apiPackageBookingController.listCancellationRules(req, res));

/**
 * @swagger
 * /api/v1/bookings/coupons/validate:
 *   post:
 *     summary: Validate a package booking coupon
 *     description: Checks coupon availability and returns discounted booking amounts before confirming a package booking.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [package_id, coupon_code]
 *             properties:
 *               package_id:
 *                 type: integer
 *                 example: 29
 *               package_slug:
 *                 type: string
 *                 example: bangkok-explorer-5n6d
 *               coupon_code:
 *                 type: string
 *                 description: Optional coupon/promo code. If valid, the API recalculates base amount, tax, total, paid amount, and remaining amount using the discount.
 *                 example: SUMMER500
 *               coupon:
 *                 type: object
 *                 description: Alternative coupon payload. The API reads coupon.code when coupon_code is not sent.
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: SUMMER500
 *               package_base_amount:
 *                 type: number
 *                 example: 32000
 *               tax_percent:
 *                 type: number
 *                 example: 5
 *               payable_now:
 *                 type: number
 *                 example: 10080
 *               customer:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   email: { type: string }
 *     responses:
 *       200:
 *         description: Coupon is valid with recalculated booking amounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Coupon is valid.
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
 *                     discount:
 *                       type: object
 *                       properties:
 *                         booking_amount: { type: number, example: 32000 }
 *                         discount_amount: { type: number, example: 500 }
 *                         amount_after_discount: { type: number, example: 31500 }
 *                     amounts:
 *                       $ref: '#/components/schemas/PackageBookingAmounts'
 *       400:
 *         description: Coupon is invalid or not applicable
 *       404:
 *         description: Coupon or package not found
 */
router.post('/coupons/validate', optionalApiAuth, (req, res) => apiPackageBookingController.validateCoupon(req, res));

/**
 * @swagger
 * /api/v1/bookings/coupons:
 *   get:
 *     summary: List package booking coupons
 *     description: Protected coupon management endpoint. Requires x-api-key.
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *           example: SUMMER500
 *       - in: query
 *         name: package_id
 *         schema:
 *           type: integer
 *           example: 29
 *     responses:
 *       200:
 *         description: Coupon list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     rows:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Coupon'
 *   post:
 *     summary: Create a package booking coupon
 *     description: Protected coupon management endpoint. Requires x-api-key.
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, discount_type, discount_value]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER500
 *               name:
 *                 type: string
 *                 example: Summer Holiday Offer
 *               description:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [fixed, percent]
 *                 example: fixed
 *               discount_value:
 *                 type: number
 *                 example: 500
 *               max_discount_amount:
 *                 type: number
 *                 nullable: true
 *                 example: 1000
 *               minimum_booking_amount:
 *                 type: number
 *                 example: 10000
 *               valid_from:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-09
 *               valid_until:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               usage_limit:
 *                 type: integer
 *                 nullable: true
 *                 example: 500
 *               usage_limit_per_customer:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               applicable_scope:
 *                 type: string
 *                 enum: [all, package_specific]
 *                 example: package_specific
 *               applicable_package_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [29, 31]
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Coupon created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Coupon created. }
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Invalid coupon payload
 *       409:
 *         description: Coupon code already exists
 */
router.get('/coupons', apiKeyAuth, async (req, res) => {
    try {
        const rows = await couponRepo.findAll();
        let coupons = couponListResponse(rows);
        const status = String(req.query.status || '').trim().toLowerCase();
        const code = String(req.query.code || '').trim().toUpperCase();
        const packageId = parseInt(req.query.package_id || req.query.packageId, 10);

        if (status === 'active') coupons = coupons.filter(coupon => coupon.is_active !== false);
        if (status === 'inactive') coupons = coupons.filter(coupon => coupon.is_active === false);
        if (code) coupons = coupons.filter(coupon => coupon.code === code);
        if (Number.isInteger(packageId) && packageId > 0) {
            coupons = coupons.filter(coupon => (
                coupon.applicable_scope === 'all' ||
                (Array.isArray(coupon.applicable_package_ids) && coupon.applicable_package_ids.map(Number).includes(packageId))
            ));
        }

        return res.json({
            success: true,
            data: {
                total: coupons.length,
                rows: coupons
            }
        });
    } catch (error) {
        console.error('Coupon list API error:', error);
        return sendCouponError(res, error);
    }
});

router.post('/coupons', apiKeyAuth, async (req, res) => {
    try {
        const payload = couponRepo.normalizePayload(req.body || {});
        const validationError = couponRepo.validatePayload(payload);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const coupon = await couponRepo.create(payload);
        return res.status(201).json({
            success: true,
            message: 'Coupon created.',
            data: couponResponse(coupon)
        });
    } catch (error) {
        console.error('Coupon create API error:', error);
        return sendCouponError(res, error);
    }
});

/**
 * @swagger
 * /api/v1/bookings/coupons/{id}:
 *   get:
 *     summary: Get a package booking coupon
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Coupon details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Coupon'
 *       404:
 *         description: Coupon not found
 *   put:
 *     summary: Update a package booking coupon
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: Coupon updated
 *       400:
 *         description: Invalid coupon payload
 *       404:
 *         description: Coupon not found
 *   patch:
 *     summary: Partially update a package booking coupon
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: Coupon updated
 *       404:
 *         description: Coupon not found
 *   delete:
 *     summary: Delete a package booking coupon
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Coupon deleted
 *       404:
 *         description: Coupon not found
 */
router.get('/coupons/:id', apiKeyAuth, async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

        return res.json({
            success: true,
            data: couponResponse(coupon)
        });
    } catch (error) {
        console.error('Coupon show API error:', error);
        return sendCouponError(res, error);
    }
});

const updateCouponApi = async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

        const payload = mergeCouponPayload(coupon, req.body || {});
        const validationError = couponRepo.validatePayload(payload);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        await coupon.update(payload);
        return res.json({
            success: true,
            message: 'Coupon updated.',
            data: couponResponse(coupon)
        });
    } catch (error) {
        console.error('Coupon update API error:', error);
        return sendCouponError(res, error);
    }
};

router.put('/coupons/:id', apiKeyAuth, updateCouponApi);
router.patch('/coupons/:id', apiKeyAuth, updateCouponApi);

/**
 * @swagger
 * /api/v1/bookings/coupons/{id}/toggle:
 *   post:
 *     summary: Activate or deactivate a package booking coupon
 *     tags: [Bookings]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 description: When omitted, toggles the current active state.
 *                 example: false
 *     responses:
 *       200:
 *         description: Coupon active state updated
 *       404:
 *         description: Coupon not found
 */
router.post('/coupons/:id/toggle', apiKeyAuth, async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

        const nextActive = req.body && req.body.is_active !== undefined
            ? (req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === '1' || req.body.is_active === 1)
            : coupon.is_active === false;
        await coupon.update({ is_active: nextActive });

        return res.json({
            success: true,
            message: nextActive ? 'Coupon activated.' : 'Coupon deactivated.',
            data: couponResponse(coupon)
        });
    } catch (error) {
        console.error('Coupon toggle API error:', error);
        return sendCouponError(res, error);
    }
});

router.delete('/coupons/:id', apiKeyAuth, async (req, res) => {
    try {
        const coupon = await couponRepo.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

        await coupon.destroy();
        return res.json({
            success: true,
            message: 'Coupon deleted.'
        });
    } catch (error) {
        console.error('Coupon delete API error:', error);
        return sendCouponError(res, error);
    }
});

/**
 * @swagger
 * /api/v1/bookings/package/{booking_id}/return-request:
 *   post:
 *     summary: Submit package return request
 *     description: Customer submits a return request for their own booking. The request stays pending until an admin/manager approves it.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package booking UUID or booking reference
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departure_date]
 *             properties:
 *               departure_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-20
 *               cancel_remaining:
 *                 type: boolean
 *                 example: true
 *               cancel_remaining_amount:
 *                 type: number
 *                 example: 23520
 *               reason:
 *                 type: string
 *                 example: Customer requested cancellation
 *     responses:
 *       201:
 *         description: Return request submitted
 *       403:
 *         description: Customer cannot request return for another customer's booking
 *       409:
 *         description: Pending return request already exists
 */
router.post('/package/:booking_id/return-request', apiAuth, (req, res) => apiPackageBookingController.createReturnRequest(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/return-requests/my:
 *   get:
 *     summary: Get my package return requests
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Current customer's return requests
 */
router.get('/package/return-requests/my', apiAuth, (req, res) => apiPackageBookingController.listMyReturnRequests(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/return-requests:
 *   get:
 *     summary: List package return requests for admin approval
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Return request list
 *       403:
 *         description: Admin/manager token required
 */
router.get('/package/return-requests', apiAuth, (req, res) => apiPackageBookingController.listReturnRequests(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/return-requests/{request_id}/approve:
 *   post:
 *     summary: Approve package return request and settle accounting
 *     description: Admin/manager approves a pending customer return request. Approval applies the cancellation rule and posts the package refund settlement to accounting.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refund_reference:
 *                 type: string
 *                 example: rfnd_manual_001
 *               razorpay_refund_id:
 *                 type: string
 *                 example: rfnd_xxx
 *               admin_notes:
 *                 type: string
 *                 example: Approved as per cancellation rule
 *     responses:
 *       200:
 *         description: Return request approved and accounting settled
 *       403:
 *         description: Admin/manager token required
 */
router.post('/package/return-requests/:request_id/approve', apiAuth, (req, res) => apiPackageBookingController.approveReturnRequest(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/return-requests/{request_id}/reject:
 *   post:
 *     summary: Reject package return request
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_notes:
 *                 type: string
 *                 example: Rejected because booking is already fulfilled
 *     responses:
 *       200:
 *         description: Return request rejected
 *       403:
 *         description: Admin/manager token required
 */
router.post('/package/return-requests/:request_id/reject', apiAuth, (req, res) => apiPackageBookingController.rejectReturnRequest(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/{booking_id}/refund:
 *   post:
 *     summary: Return/refund a package booking
 *     description: Records package return/refund with active cancellation rules. Accounting reverses Vendor Payables, Sales Revenue, and GST proportionally, then credits the customer account for refundable value and Accounts Receivable for cancelled remaining balance. Admin/manager token required.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package booking UUID or booking reference
 *         example: PT-PKG-0029-MPXNXLJNV9FS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refund_amount:
 *                 type: number
 *                 description: Manual refund amount when apply_cancellation_rule is false.
 *                 example: 10080
 *               apply_cancellation_rule:
 *                 type: boolean
 *                 description: Defaults to true. Uses the active cancellation rule based on departure date.
 *                 example: true
 *               departure_date:
 *                 type: string
 *                 format: date
 *                 description: Required when the booking payload does not already include a departure/travel/start date.
 *                 example: 2026-06-20
 *               cancel_remaining:
 *                 type: boolean
 *                 description: Whether to cancel the full unpaid remaining amount. Defaults to true.
 *                 example: true
 *               cancel_remaining_amount:
 *                 type: number
 *                 description: Specific unpaid amount to cancel instead of full remaining amount.
 *                 example: 23520
 *               reason:
 *                 type: string
 *                 example: Customer requested cancellation
 *               refund_reference:
 *                 type: string
 *                 example: rfnd_manual_001
 *               razorpay_refund_id:
 *                 type: string
 *                 example: rfnd_Razorpay001
 *               refunded_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Refund/return recorded in booking and accounting
 *       400:
 *         description: Invalid refund/cancellation amount or original accounting missing
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin/manager token required
 *       404:
 *         description: Package booking not found
 */
router.post('/package/:booking_id/refund', apiAuth, (req, res) => apiPackageBookingController.refundBooking(req, res));

/**
 * @swagger
 * /api/v1/bookings/package/{booking_id}/return-refund:
 *   post:
 *     summary: Return a package booking and process refund
 *     description: Alias of POST /api/v1/bookings/package/{booking_id}/refund for return/cancellation flows. Admin/manager token required.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package booking UUID or booking reference
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refund_amount:
 *                 type: number
 *                 example: 10080
 *               apply_cancellation_rule:
 *                 type: boolean
 *                 example: true
 *               departure_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-20
 *               cancel_remaining:
 *                 type: boolean
 *                 example: true
 *               reason:
 *                 type: string
 *                 example: Customer requested cancellation
 *               refund_reference:
 *                 type: string
 *                 example: rfnd_manual_001
 *     responses:
 *       200:
 *         description: Return/refund recorded in booking and accounting
 *       401:
 *         description: Access token required
 *       403:
 *         description: Admin/manager token required
 *       404:
 *         description: Invalid or expired token
 */
/**
 * @swagger
 * /api/v1/bookings/create-booking:
 *   post:
 *     summary: Create a package booking and record vendor accounting split
 *     description: >
 *       Stores the package booking payload, links it to the package/vendor,
 *       saves hotel selections in raw_payload, posts accounting entries when payment is verified,
 *       persists per-traveller passenger details in booking_passengers,
 *       and queues an itinerary email in booking_email_queue for the customer.
 *       If passengers[] is omitted, a single lead passenger is auto-created from the customer object.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - package_id
 *               - package_slug
 *               - package_total
 *               - customer
 *             properties:
 *               package_id: { type: integer, example: 29 }
 *               package_slug: { type: string, example: bangkok-explorer-5n6d }
 *               package_name: { type: string, example: Bangkok Explorer - 5N6D }
 *               package_price: { type: number, example: 32000 }
 *               package_base_amount: { type: number, example: 32000 }
 *               tax_type: { type: string, example: GST }
 *               tax_percent: { type: number, example: 5 }
 *               tax_amount: { type: number, example: 1575 }
 *               package_total: { type: number, example: 33075 }
 *               coupon_code: { type: string, example: SUMMER500 }
 *               duration: { type: string, example: 5N/6D }
 *               route: { type: array, items: { type: string }, example: [Bali, Philippines] }
 *               hotel_count: { type: integer, example: 3 }
 *               hotel_estimated_amount: { type: number, example: 24200 }
 *               partial_booking_enabled: { type: boolean, example: true }
 *               partial_booking_percentage: { type: number, example: 30 }
 *               payable_now: { type: number, example: 10080 }
 *               remaining_amount: { type: number, example: 23520 }
 *               remaining_percentage: { type: number, example: 70 }
 *               customer:
 *                 type: object
 *                 required: [name, email]
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   name: { type: string, example: Akash Sharma }
 *                   email: { type: string, example: akash@gmail.com }
 *                   phone: { type: string, example: "9876543210" }
 *               passengers:
 *                 type: array
 *                 description: Per-traveller details. First item is treated as the lead passenger. If omitted, auto-created from customer.
 *                 items:
 *                   type: object
 *                   required: [full_name]
 *                   properties:
 *                     full_name: { type: string, example: Akash Sharma }
 *                     age: { type: integer, example: 28 }
 *                     gender: { type: string, enum: [male, female, other], example: male }
 *                     dob: { type: string, format: date, example: "1996-04-15" }
 *                     nationality: { type: string, example: Indian }
 *                     passport_no: { type: string, example: P1234567 }
 *                     passport_expiry: { type: string, format: date, example: "2030-01-01" }
 *                     is_lead: { type: boolean, example: true }
 *               status: { type: string, example: payment_verified }
 *               page_url: { type: string }
 *               razorpay_order_id: { type: string, example: order_Swm2GDnbf2nFqr }
 *               razorpay_payment_id: { type: string, example: pay_Swm2O7nuADT4f9 }
 *               payment_verified_at: { type: string, format: date-time }
 *           examples:
 *             withPassengers:
 *               summary: Booking with passenger details
 *               value:
 *                 package_id: 29
 *                 package_slug: bangkok-explorer-5n6d
 *                 package_name: Bangkok Explorer - 5N6D
 *                 package_base_amount: 32000
 *                 tax_type: GST
 *                 tax_percent: 5
 *                 tax_amount: 1575
 *                 package_total: 33075
 *                 duration: 5N/6D
 *                 partial_booking_enabled: true
 *                 partial_booking_percentage: 30
 *                 payable_now: 9922.5
 *                 remaining_amount: 23152.5
 *                 customer:
 *                   id: 974cfab8-b3e9-4d1d-9a73-03c730fdba31
 *                   name: Akash Sharma
 *                   email: akash@gmail.com
 *                   phone: "9876543210"
 *                 passengers:
 *                   - full_name: Akash Sharma
 *                     age: 28
 *                     gender: male
 *                     dob: "1996-04-15"
 *                     nationality: Indian
 *                     passport_no: P1234567
 *                     passport_expiry: "2030-01-01"
 *                     is_lead: true
 *                   - full_name: Priya Sharma
 *                     age: 25
 *                     gender: female
 *                     nationality: Indian
 *                 status: payment_verified
 *                 razorpay_order_id: order_Swm2GDnbf2nFqr
 *                 razorpay_payment_id: pay_Swm2O7nuADT4f9
 *     responses:
 *       201:
 *         description: Booking created with passenger details and accounting split
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Package booking recorded and vendor split added to accounting. }
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/PackageBookingResponse'
 *                     - type: object
 *                       properties:
 *                         passengers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id: { type: string, format: uuid }
 *                               full_name: { type: string }
 *                               age: { type: integer, nullable: true }
 *                               gender: { type: string, enum: [male, female, other], nullable: true }
 *                               dob: { type: string, format: date, nullable: true }
 *                               nationality: { type: string, nullable: true }
 *                               passport_no: { type: string, nullable: true }
 *                               passport_expiry: { type: string, format: date, nullable: true }
 *                               is_lead: { type: boolean }
 *       200:
 *         description: Booking already exists for this Razorpay payment id
 *       404:
 *         description: Package not found
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
router.post('/create-booking', apiAuth, (req, res) => apiPackageBookingController.createBooking(req, res));


/**
 * @swagger
 * /api/v1/bookings/package:
 *   post:
 *     summary: Confirm a package booking and record vendor accounting split
 *     description: Backward-compatible alias of POST /api/v1/bookings/create-booking. Accepts coupon_code/coupon.code and returns the applied coupon snapshot with recalculated amounts.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageBookingCreateRequest'
 *     responses:
 *       201:
 *         description: Package booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/PackageBookingResponse'
 * /api/v1/bookings/package/confirm:
 *   post:
 *     summary: Confirm a package booking and record vendor accounting split
 *     description: Alias of POST /api/v1/bookings/create-booking. Accepts coupon_code/coupon.code and returns the applied coupon snapshot with recalculated amounts.
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageBookingCreateRequest'
 *     responses:
 *       201:
 *         description: Package booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/PackageBookingResponse'
 */
router.post('/package', optionalApiAuth, (req, res) => apiPackageBookingController.confirm(req, res));
router.post('/package/confirm', optionalApiAuth, (req, res) => apiPackageBookingController.confirm(req, res));

/**
 * @swagger
 * /api/v1/bookings/checkout:
 *   post:
 *     summary: Checkout and confirm booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_trip_id:
 *                 type: integer
 *               package_id:
 *                 type: integer
 *               customer_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking confirmed successfully
 */
router.post('/checkout', async (req, res) => {
    try {
        const { custom_trip_id, customer_id } = req.body;
        
        if (!customer_id) {
            return res.status(400).json({ success: false, message: 'Customer ID is required for checkout' });
        }

        if (!custom_trip_id) {
            return res.status(400).json({ success: false, message: 'Must provide custom_trip_id' });
        }

        const trip = await customTripRepo.getTripById(custom_trip_id);
        if (!trip) return res.status(404).json({ success: false, message: 'Custom Trip not found' });
        const total_amount = trip.total_price;
        
        // Mark trip as booked
        await trip.update({ status: 'booked' });

        // Simulate Gateway Payment Creation
        const payment = await bookingRepo.createPayment({
            custom_trip_id: trip.id,
            amount: total_amount,
            status: 'success', // Simulating successful payment
            transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9),
            gateway_response: { status: 'captured', method: 'credit_card' }
        });

        // Update Trip Status due to successful payment
        await bookingRepo.updateBookingStatus(trip.id, 'confirmed');

        const mockBooking = {
            id: trip.id,
            booking_reference: 'PT-BKB' + String(trip.id).padStart(5, '0'),
            type: 'custom_trip',
            total_amount: total_amount,
            payment_status: 'paid',
            booking_status: 'confirmed'
        };

        res.status(201).json({ 
            success: true, 
            message: 'Booking confirmed successfully', 
            data: { booking: mockBooking, payment }
        });
    } catch (error) {
        console.error('Booking Checkout Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/v1/bookings/crowd-levels/slug/{slug}:
 *   get:
 *     summary: Get dynamic crowd levels for a specific destination by slug
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the destination
 *     responses:
 *       200:
 *         description: Crowd levels
 *       404:
 *         description: Destination not found
 */
router.get('/crowd-levels/slug/:slug', async (req, res) => {
    try {
        const { models: { Destination, DestinationCrowdLevel } } = require('../container');
        const { Op } = require('sequelize');
        
        // Find the destination by slug to get its ID
        const targetDest = await Destination.findOne({ where: { slug: req.params.slug } });
        if (!targetDest) {
             return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        
        const today = new Date();
        const futureDate = new Date();
        futureDate.setMonth(today.getMonth() + 6); // Limit to next 6 months
        
        const data = await DestinationCrowdLevel.findAll({
            where: {
                destination_id: targetDest.id,
                date: {
                    [Op.gte]: today,
                    [Op.lte]: futureDate
                }
            },
            attributes: ['date', 'level'],
            order: [['date', 'ASC']]
        });
        
        const formattedData = data.map(item => ({
            date: item.date,
            crowd_level: item.level
        }));
        
        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


/**
 * @swagger
 * /api/v1/booking/package/customize:
 *   post:
 *     summary: Submit a custom package booking request
 *     description: Creates a package booking entry marked as a custom request.
 *     tags: [Bookings - Package]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [package_id, customer]
 *             properties:
 *               package_id:
 *                 type: integer
 *                 example: 29
 *               message:
 *                 type: string
 *                 example: I need a vegetarian meal plan.
 *               customer:
 *                 type: object
 *                 properties:
 *                   name: { type: string, example: John Doe }
 *                   email: { type: string, example: john@example.com }
 *                   phone: { type: string, example: "9876543210" }
 *     responses:
 *       201:
 *         description: Custom request submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Package not found
 */
router.post('/package/customize', optionalApiAuth, async (req, res) => {
    try {
        const payload = req.body || {};
        const { package_id, customer, message } = payload;
        
        if (!package_id || !customer || !customer.name || !customer.email) {
            return res.status(400).json({ success: false, message: 'package_id, and customer name, email are required' });
        }

        const pkg = await apiPackageBookingController.models.Package.findByPk(package_id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        const customerId = await apiPackageBookingController.resolveCustomerId(customer);
        const reference = apiPackageBookingController.buildReference(package_id) + '-CUST';
        const raw_payload = { ...payload, is_customized: true, custom_message: message };

        const booking = await apiPackageBookingController.models.PackageBooking.create({
            booking_reference: reference,
            package_id: pkg.id,
            package_slug: pkg.slug,
            package_name: pkg.name,
            vendor_id: pkg.vendor_id,
            customer_id: customerId,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            package_base_amount: 0,
            tax_type: pkg.tax_type,
            tax_percent: pkg.tax_percent || 0,
            tax_amount: 0,
            package_total: 0,
            paid_amount: 0,
            remaining_amount: 0,
            payment_status: 'custom_request',
            accounting_status: 'pending',
            raw_payload
        });

        res.status(201).json({ success: true, message: 'Customization request submitted successfully', data: booking });
    } catch (err) {
        console.error('Custom Package Request Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
