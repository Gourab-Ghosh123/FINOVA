const {getAccountByUserId} = require("../services/account.service");

const getMyAccount = async(req , res , next) => {
    
    try {
        const userId = req.user.id;

    const account = await getAccountByUserId(userId);

    if(!account) {
        return res.status(404).json({
            status : "error",
            message : "Account not found"
        });
    }

    return res.status(200).json({
        status : "success",
        data : account
    });
    }
    catch(error) {
        next(error);
    }
}

module.exports = {getMyAccount};