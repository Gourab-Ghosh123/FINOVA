const crypto = require("crypto");

const verifyRazorpaySignature = (
    orderId,
    paymentId,
    signature
) => {

    if (
        typeof orderId !== "string" ||
        typeof paymentId !== "string" ||
        typeof signature !== "string" ||
        !/^[a-f0-9]{64}$/i.test(signature)
    ) {
        return false;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        throw new Error("Razorpay Key Secret is missing");
    }

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const actualBuffer = Buffer.from(signature, "hex");

    return crypto.timingSafeEqual(
        expectedBuffer,
        actualBuffer
    );

};

module.exports = {
    verifyRazorpaySignature
};