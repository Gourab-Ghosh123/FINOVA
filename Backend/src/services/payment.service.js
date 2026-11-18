const pool = require("../config/database");
const {randomUUID} = require("crypto");
const razorpay = require("../config/razorpay");

const {findAccountByIdAndUserId} = require("../repository/account.repository");
const {createPaymentOrder , updatePaymentOrderGatewayDetails , markPaymentOrderFailed} = require("../repository/payment.repository");
const {AppError} = require("../utils/appError");


const createPaymentOrderService = async(userId , accountId , amountPaise) => {
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

        const localOrder = await createPaymentOrder(client , {
            orderId,
            userId,
            accountId,
            amountPaise,
            gatewayOrderId : null
            
        });

        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
            amount : amountPaise,
            currency : "INR",
            receipt : orderId,
            notes : {
                fincoreOrderId : orderId,
                userId : String(userId),
                accountId : String(accountId)
            }
        });
        }
        catch(error) {
            await markPaymentOrderFailed(client , orderId , error.message || "Razorpay order creation failed");

            throw new AppError("Unable to create payment with razorpay" , 502);
        }

        const updatedOrder = await updatePaymentOrderGatewayDetails(client , orderId , razorpayOrder.id);

        if(!updatedOrder) {
            throw new AppError("Payment Order could not be updated" , 500);
        }

        return {
            orderId : updatedOrder.order_id,
            gatewayOrderId : updatedOrder.gateway_order_id,
            amountPaise : updatedOrder.amount_paise,
            currency : updatedOrder.currency,
            status : updatedOrder.status,
            keyId : process.env.RAZORPAY_KEY_ID
        };
    }
    finally {
        client.release();
    }
}

module.exports = {
    createPaymentOrderService
};