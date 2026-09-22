const crypto = require('crypto');

function createSecureHash(payload, secureKey) {
    const hashText = Object.keys(payload)
        .filter(
            key =>
                key !== 'secureHash' &&
                payload[key] !== null &&
                payload[key] !== undefined &&
                payload[key] !== ''
        )
        .sort()
        .map(key => String(payload[key]))
        .join('');

    return crypto
        .createHmac('sha256', secureKey)
        .update(hashText, 'ascii')
        .digest('hex')
        .toLowerCase();
}

module.exports = {
    createSecureHash
};