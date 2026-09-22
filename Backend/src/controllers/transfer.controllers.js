const {transferMoney} = require("../services/transfer.service");
const createTransfer = async(req , res , next) => {
    try {
        const {fromAccountId , toAccountId , amount} = req.body;
        const idempotencyKey = req.headers["idempotency-key"];

        const result = await transferMoney(fromAccountId , toAccountId , amount , idempotencyKey);

        return res.status(201).json({
            success : true,
            data : result
        });
    }
    catch(error) {
        next(error);
    }
}

module.exports = {
    createTransfer
};