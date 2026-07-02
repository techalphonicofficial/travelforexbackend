const fs = require('fs');

const routeStr = `
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

        const pkg = await bookingRepo.models.Package.findByPk(package_id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        const customerId = await apiPackageBookingController.resolveCustomerId(customer);
        const reference = apiPackageBookingController.buildReference(package_id) + '-CUST';
        const raw_payload = { ...payload, is_customized: true, custom_message: message };

        const booking = await bookingRepo.models.PackageBooking.create({
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
`;

let content = fs.readFileSync('src/routes/apiBookingRoutes.js', 'utf8');
content = content.replace('module.exports = router;', routeStr + '\nmodule.exports = router;');
fs.writeFileSync('src/routes/apiBookingRoutes.js', content);
console.log("Appended custom package API");
