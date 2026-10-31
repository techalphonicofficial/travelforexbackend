/*
 * Mobile number typed next to a country code (booking contact details).
 * India (+91): 10 digits starting with 6-9. Other countries: 6-14 digits.
 * Same rule as the website (travel-forex utils/phone.js).
 */
const isValidNationalNumber = (number, countryCode = '+91') => {
    const digits = String(number ?? '').replace(/\D/g, '');
    const code = String(countryCode || '+91').replace(/\D/g, '') || '91';
    if (code === '91') return /^[6-9]\d{9}$/.test(digits);
    return digits.length >= 6 && digits.length <= 14;
};

module.exports = { isValidNationalNumber };
