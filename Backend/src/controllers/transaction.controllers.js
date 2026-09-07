const transferService = require("../services/transfer.service");
const pool = require("../config/database");

const getTransactionController = async(req , res , next) => {

    try{

        const transactionId = Number(req.params.id);
        const transaction = await transferService.getTransaction(pool , transactionId);

        res.status(200).json({
            success : true,
            message : transaction
        });
    }
    catch(error) {
        next(error);
    }
}

module.exports = {getTransactionController};