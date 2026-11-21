const pool = require("../config/database");
const { randomUUID } = require("crypto");

const razorpay = require("../config/razorpay");

const {
    findAccountByIdAndUserId
} = require("../repository/account.repository");

const {
    createPaymentOrder,
    updatePaymentOrderGatewayDetails,
    findPaymentOrderByGatewayOrderIdAndUserId,
} = require("../repository/payment.repository");

const {AppError} = require("../errors/AppError");

const {verifyRazorPaySignature} = require("../utils/razorpaySignature");


const createPaymentOrderService = async (userId, accountId, amountPaise) => {

    // Step 1: Validate amount
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
        throw new AppError("Invalid payment amount", 400);
    }

    const orderId = `FIN_${randomUUID()}`;

    let localOrder;

    // Step 2: Verify account and save local order
    const client = await pool.connect();

    try {

        const account = await findAccountByIdAndUserId(
            client,
            accountId,
            userId
        );

        if (!account) {
            throw new AppError(
                "Account not found or does not belong to this user",
                404
            );
        }

        if (account.status !== "ACTIVE") {
            throw new AppError("Account is not active", 400);
        }

        if (account.currency !== "INR") {
            throw new AppError(
                "Account currency is not supported for payment",
                400
            );
        }

        localOrder = await createPaymentOrder(client, {
            orderId,
            userId,
            accountId,
            amountPaise,
            gatewayOrderId: null
        });

        if (!localOrder) {
            throw new AppError(
                "Could not create local payment order",
                500
            );
        }

    } finally {
        client.release();
    }

    // Step 3: Create order with Razorpay
    let razorpayOrder;

    try {

        razorpayOrder = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt: orderId,
            notes: {
                fincoreOrderId: orderId,
                userId: String(userId),
                accountId: String(accountId)
            }
        });

    } catch (error) {

        // Keep the local order PENDING.
        // A network error does not prove Razorpay failed to create it.

        throw new AppError(
            "Unable to confirm payment order creation with Razorpay",
            502
        );
    }

    // Step 4: Save Razorpay's order ID in our database
    const updateClient = await pool.connect();

    let updatedOrder;

    try {

        updatedOrder = await updatePaymentOrderGatewayDetails(
            updateClient,
            orderId,
            razorpayOrder.id
        );

        if (!updatedOrder) {
            throw new AppError(
                "Razorpay order was created, but local order update failed",
                500
            );
        }

    } finally {
        updateClient.release();
    }

    // Step 5: Return order details to the controller
    return {
        orderId: updatedOrder.order_id,
        gatewayOrderId: updatedOrder.gateway_order_id,
        amountPaise: updatedOrder.amount_paise,
        currency: updatedOrder.currency,
        status: updatedOrder.status,
        keyId: process.env.RAZORPAY_KEY_ID
    };

};

const verifyPayment = async (
    userId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
) => {

    // Step 1: Find the payment order belonging to this user
    const client = await pool.connect();

    let paymentOrder;

    try {
        paymentOrder = await findPaymentOrderByGatewayOrderIdAndUserId(
            client,
            razorpay_order_id,
            userId
        );
    } finally {
        client.release();
    }

    if (!paymentOrder) {
        throw new AppError("Payment order not found", 404);
    }

    // Step 2: Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValidSignature) {
        throw new AppError("Invalid payment signature", 400);
    }

    // Step 3: Fetch actual payment details from Razorpay
    let razorpayPayment;

    try {
        razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );
    } catch (error) {
        throw new AppError("Unable to verify payment with Razorpay", 502);
    }

    // Step 4: Validate payment details
    if (
        razorpayPayment.order_id !== razorpay_order_id ||
        razorpayPayment.amount !== Number(paymentOrder.amount_paise) ||
        razorpayPayment.currency !== paymentOrder.currency
    ) {
        throw new AppError("Payment details do not match our order", 400);
    }

    // Step 5: Check whether payment is captured
    if (razorpayPayment.status !== "captured") {
        throw new AppError(
            `Payment is not captured. Current status: ${razorpayPayment.status}`,
            400
        );
    }

    return {
        message: "Payment verified successfully",
        orderId: paymentOrder.order_id,
        paymentId: razorpay_payment_id,
        amountPaise: paymentOrder.amount_paise,
        status: razorpayPayment.status
    };
};


module.exports = {
    createPaymentOrderService,
    verifyPayment
};