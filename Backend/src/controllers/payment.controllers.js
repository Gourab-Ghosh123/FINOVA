const {
    createPaymentOrderService,
    verifyPayment
} = require("../services/payment.service");


const createPaymentOrderController = async (req, res, next) => {

    try {

        const { accountId, amountPaise } = req.body;

        const userId = req.user.id;

        const result = await createPaymentOrderService(
            userId,
            accountId,
            amountPaise
        );

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            data: result
        });

    } catch (error) {

        next(error);

    }

};

const verifyPaymentController = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user.id;

        const result = await verifyPayment(
            userId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createPaymentOrderController,
    verifyPaymentController
};