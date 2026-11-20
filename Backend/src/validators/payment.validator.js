const {z} = require("zod");

const createPaymentOrderSchema = z.object({
    accountId : z.coerce.number().int("Account Id must be an integer..").positive("Account Id must be greater than zero.."),

    amountPaise : z.number().int("Amount must be an integer").positive("Amount must be greater than zero..")
});

const verifyPaymentSchema = z.object({

    razorpay_order_id: z.string()
        .trim()
        .min(1, "Razorpay order ID is required"),

    razorpay_payment_id: z.string()
        .trim()
        .min(1, "Razorpay payment ID is required"),

    razorpay_signature: z.string()
        .regex(
            /^[a-f0-9]{64}$/i,
            "Invalid Razorpay signature format"
        )

});

module.exports = {
    createPaymentOrderSchema,
    verifyPaymentSchema
};