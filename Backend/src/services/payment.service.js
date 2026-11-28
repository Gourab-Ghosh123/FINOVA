const pool = require("../config/database");
const { randomUUID } = require("crypto");

const razorpay = require("../config/razorpay");

const {
    findAccountByIdAndUserId,
    updateBalance
} = require("../repository/account.repository");

const {createDepositTransaction} = require("../repository/transaction.repository");

const {createLedgerEntry} = require("../repository/ledger.repository");


const {
    createPaymentOrder,
    updatePaymentOrderGatewayDetails,
    findPaymentOrderByGatewayOrderIdAndUserId,
    createPaymentAttempt,
    findPaymentAttemptByGatewayPaymentId,
    updatePaymentAttempt,
    markPaymentOrderSuccess,
    findPaymentOrderForUpdate ,
    findCapturedAttemptByPaymentOrderId
} = require("../repository/payment.repository");

const {AppError} = require("../errors/AppError");
const {verifyRazorpaySignature} = require("../utils/razorpaySignature");
const {getAccountForUpdate} = require("../repository/transfer.repository");



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

  // Step 6: Start an atomic database transaction
const dbClient = await pool.connect();
    let transactionStarted = false;
try {
    await dbClient.query("BEGIN");
    transactionStarted = true;

    // Lock the payment order to prevent duplicate processing
    const lockedPaymentOrder = await findPaymentOrderForUpdate(
        dbClient,
        razorpay_order_id,
        userId
    );

    if (!lockedPaymentOrder) {
        throw new AppError("Payment order not found", 404);
    }

    // Revalidate payment details using the locked database record
if (
    lockedPaymentOrder.gateway_order_id !== razorpay_order_id ||
    Number(lockedPaymentOrder.amount_paise) !== razorpayPayment.amount ||
    lockedPaymentOrder.currency !== razorpayPayment.currency
) {
    throw new AppError(
        "Locked payment order details do not match Razorpay payment",
        400
    );
}

    // If already successful, never credit the wallet again
    if (lockedPaymentOrder.status === "SUCCESS") {

    // Same payment ID means this is a safe retry
    if (
        lockedPaymentOrder.gateway_payment_id !==
        razorpay_payment_id
    ) {
        throw new AppError(
            "A different payment is already recorded for this order. Manual reconciliation required.",
            409
        );
    }

    await dbClient.query("COMMIT");
     transactionStarted = false;

    return {
        message: "Payment was already processed",
        orderId: lockedPaymentOrder.order_id,
        paymentId: lockedPaymentOrder.gateway_payment_id,
        status: "SUCCESS",
        alreadyProcessed: true
    };
}

    if (lockedPaymentOrder.status !== "PENDING") {
        throw new AppError("Payment order cannot be processed", 409);
    }

    // Lock the user's wallet account
    const account = await getAccountForUpdate(
        dbClient,
        lockedPaymentOrder.account_id
    );

    if (!account) {
        throw new AppError("Wallet account not found", 404);
    }

    if (
    String(account.user_id) !== String(lockedPaymentOrder.user_id)
) {
    throw new AppError(
        "Payment order does not belong to this wallet account",
        403
    );
}

    if (account.status !== "ACTIVE") {
    throw new AppError(
        "Cannot credit an inactive wallet account",
        400
    );
}

    // Check whether this Razorpay payment attempt already exists
    const existingAttempt = await findPaymentAttemptByGatewayPaymentId(
        dbClient,
        razorpay_payment_id
    );

    if (existingAttempt) {
        if (
            String(existingAttempt.payment_order_id) !==
            String(lockedPaymentOrder.id)
        ) {
            throw new AppError("Payment attempt belongs to another order", 409);
        }

       if (existingAttempt.status === "CAPTURED") {
    throw new AppError(
        "Payment attempt is already captured but payment order is still pending. Manual reconciliation required.",
        409
    );
}

const updatedAttempt = await updatePaymentAttempt(
    dbClient,
    razorpay_payment_id,
    {
        status: "CAPTURED",
        method: razorpayPayment.method,
        failureReason: null
    }
);

if (!updatedAttempt) {
    throw new AppError(
        "Unable to update payment attempt",
        500
    );
}
    } 
 else {

    const capturedAttempt = await findCapturedAttemptByPaymentOrderId(
        dbClient,
        lockedPaymentOrder.id
    );

    if (capturedAttempt) {
        throw new AppError(
            "Another payment attempt is already captured for this order. Manual reconciliation required.",
            409
        );
    }

    const createdAttempt = await createPaymentAttempt(dbClient, {
        paymentOrderId: lockedPaymentOrder.id,
        gatewayPaymentId: razorpay_payment_id,
        amountPaise: lockedPaymentOrder.amount_paise,
        status: "CAPTURED",
        method: razorpayPayment.method
    });

    if (!createdAttempt) {
        throw new AppError(
            "Unable to create payment attempt",
            500
        );
    }
}

    // Credit the wallet
    const updatedAccount = await updateBalance(
        dbClient,
        lockedPaymentOrder.account_id,
        lockedPaymentOrder.amount_paise
    );

    if (!updatedAccount) {
        throw new AppError("Unable to credit wallet", 500);
    }

    if (
    String(updatedAccount.id) !==
    String(lockedPaymentOrder.account_id)
) {
    throw new AppError(
        "Updated wallet account does not match payment order",
        500
    );
}

    // Create a deposit transaction
    const transaction = await createDepositTransaction(
        dbClient,
        `PAY_${lockedPaymentOrder.order_id}`,
        lockedPaymentOrder.account_id,
        lockedPaymentOrder.amount_paise
    );

    if (!transaction) {
    throw new AppError(
        "Unable to create deposit transaction",
        500
    );
}

    // Create the corresponding CREDIT ledger entry
    const ledgerEntry = await createLedgerEntry(
    dbClient,
    transaction.id,
    lockedPaymentOrder.account_id,
    "CREDIT",
    lockedPaymentOrder.amount_paise
);

if (!ledgerEntry) {
    throw new AppError(
        "Unable to create ledger entry",
        500
    );
}

    // Mark the payment order as successful
  const successfulPaymentOrder = await markPaymentOrderSuccess(
    dbClient,
    lockedPaymentOrder.order_id,
    razorpay_payment_id
);

if (!successfulPaymentOrder) {
    throw new AppError(
        "Unable to mark payment order as successful",
        409
    );
}
    // Save all changes together
    await dbClient.query("COMMIT");
     transactionStarted = false;
    return {
        message: "Payment verified and wallet credited successfully",
        orderId: lockedPaymentOrder.order_id,
        paymentId: razorpay_payment_id,
        amountPaise: lockedPaymentOrder.amount_paise,
        status: "SUCCESS",
        alreadyProcessed: false
    };

}  catch (error) {

    if (transactionStarted) {
        try {
            await dbClient.query("ROLLBACK");
        } catch (rollbackError) {
            // Preserve the original error.
        }
    }

    throw error;

} finally {
    dbClient.release();

};

}
module.exports = {
    createPaymentOrderService,
    verifyPayment
};