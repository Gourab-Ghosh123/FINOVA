const {reconcileAccount} = require("../services/reconcilation.service");

const reconcileAccountControllers = async(req , res , next) => {
    try {
        const accountId = Number(req.params.accountId);

        const result = await reconcileAccount(accountId);

        return res.status(200).json(result);
    }
    catch(error) {
        next(error);
    }
}

module.exports = {reconcileAccountControllers};