const {
    createPaymentOrderService
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


module.exports = {
    createPaymentOrderController
};