const crypto = require("crypto");

const SECRET_KEY = "db06cca0-838b-4e01-8b20-6ac446ffb6bd";

function generateSecureHash(request) {
  // secureHash ko hash calculation se exclude karo
  const hashText = Object.keys(request)
    .filter(
      (key) =>
        key !== "secureHash" &&
        request[key] !== null &&
        request[key] !== undefined &&
        request[key] !== ""
    )
    .sort()
    .map((key) => String(request[key]))
    .join("");

  console.log("Sorted Keys:");
  console.log(
    Object.keys(request)
      .filter((key) => key !== "secureHash")
      .sort()
  );

  console.log("\nHash Text:");
  console.log(hashText);

  const secureHash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(hashText, "ascii")
    .digest("hex")
    .toLowerCase();

  console.log("\nSecure Hash:");
  console.log(secureHash);

  return secureHash;
}


const request = {
  merchantId: "100000000007164",
  aggregatorID: "A100000000007164",
  merchantTxnNo: "TXN12345678",
  amount: "100.00",
  currencyCode: "356",
  payType: "0",
  customerEmailID: "test@travel-forex.com",
  transactionType: "SALE",
  returnURL: "https://travel-forex.com/payment/callback",
  txnDate: "20260922170000",
  customerMobileNo: "919999999999",
  customerName: "Test User",
  addlParam1: "000",
  addlParam2: "111"
};

request.secureHash = generateSecureHash(request);

console.log(request);

module.exports = {
  generateSecureHash
};