const pool = require("../config/database");
const {randomUUID} = require("crypto");
const razorpay = require("../config/razorpay");

const {findAccountByIdAndUserId} = require("../repository/account.repository");
const {createPaymentOrder , updatePaymentOrderGatewayDetails , markPaymentOrderFailed} = require("../repository/payment.repository");
const {AppError} = require("../utils/appError");


const createPaymentOrder = async(userId , accountId , amountPaise) => {
    const client = await pool.connect();
    try {
        const account = await findAccountByIdAndUserId(client , accountId , userId);
         
        if(!account) {
            throw new AppError("Account not found or does not belong to the user" , 404);
        }

        if(account.status !== "ACTIVE") {
            throw new AppError("Account is not active" , 400);
        }

        if(account.currency !== "INR") {
            throw new AppError("Account currency is not supported for payment" , 400);
        }

        const orderId = `FIN_${randomUUID()}`;
    }
    finally {
        client.release();
    }
}