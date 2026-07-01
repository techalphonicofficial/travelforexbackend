class TaxCalculationService {
    constructor(companyState = 'Delhi') {
        this.companyState = companyState;
    }

    /**
     * Calculate taxes for a trip based on destination breakdown
     * @param {Array} destinationBreakdown - Array of { destId, amount, destinationModel }
     * @returns {Object} { base_price, total_tax, tax_breakdown, grand_total }
     */
    calculateTripTaxes(destinationBreakdown) {
        let base_price = 0;
        let total_tax = 0;
        let grand_total = 0;
        let tax_breakdown = {};

        destinationBreakdown.forEach(item => {
            const amount = parseFloat(item.amount) || 0;
            const dest = item.destinationModel;

            if (!dest || amount <= 0) return;

            base_price += amount;

            const ruleType = dest.tax_rule_type || 'domestic';
            const gstRate = parseFloat(dest.gst_rate) || 0;

            if (ruleType === 'exempt') {
                // No taxes
                return;
            }

            let taxAmount = 0;
            if (dest.gst_amount && parseFloat(dest.gst_amount) > 0) {
                taxAmount = parseFloat(dest.gst_amount);
            } else if (gstRate > 0) {
                taxAmount = (amount * gstRate) / 100;
            }

            if (ruleType === 'domestic') {
                if (taxAmount > 0) {
                    // Check intra-state vs inter-state
                    if (dest.state && dest.state.toLowerCase() === this.companyState.toLowerCase()) {
                        const halfTax = taxAmount / 2;
                        const sgstKey = `SGST (${dest.name})`;
                        const cgstKey = `CGST (${dest.name})`;
                        tax_breakdown[sgstKey] = (tax_breakdown[sgstKey] || 0) + halfTax;
                        tax_breakdown[cgstKey] = (tax_breakdown[cgstKey] || 0) + halfTax;
                        total_tax += taxAmount;
                    } else {
                        const igstKey = `IGST (${dest.name})`;
                        tax_breakdown[igstKey] = (tax_breakdown[igstKey] || 0) + taxAmount;
                        total_tax += taxAmount;
                    }
                }
            } else if (ruleType === 'international_outbound') {
                // Apply GST if configured (TCS removed)
                if (taxAmount > 0) {
                    const gstKey = `IGST (${dest.name})`; // usually IGST for foreign
                    tax_breakdown[gstKey] = (tax_breakdown[gstKey] || 0) + taxAmount;
                    total_tax += taxAmount;
                }
            }
        });

        grand_total = base_price + total_tax;

        return {
            base_price,
            total_tax,
            tax_breakdown,
            grand_total
        };
    }
}

module.exports = TaxCalculationService;
