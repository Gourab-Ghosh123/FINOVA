const {transferMoney} = require("../services/transfer.service");
const createTranfer = async(req , res , next) => {
    try {
        const {fromAccountId , toAccountId , amount} = req.body;
    const result = await transferMoney(fromAccountId , toAccountId , amount);

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
    createTranfer
};