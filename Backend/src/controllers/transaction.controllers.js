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

const getTransactionByAccountController = async(req , res , next) => {

    try {
        const accountId = Number(req.params.accountId);

        const page = Number(req.query.page || 1);

        const limit = Number(req.query.limit || 20);


        const transactions = await transferService.getTransactionsByAccount(pool , accountId , page , limit);

        res.status(200).json({
            status : true,
            message : transactions
        });
    }
    catch(error) {
        next(error);
    }
}

module.exports = {getTransactionController , getTransactionByAccountController};