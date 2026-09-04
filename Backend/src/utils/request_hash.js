const crypto = require("crypto");

const createRequestHash = ({fromAccountId , toAccountId , amountPaise}) => {

    const payload = JSON.stringify({fromAccountId , toAccountId , amountPaise});

    return crypto.createHash("sha256").update(payload).digest("hex");
}

module.exports = {
    createRequestHash
};