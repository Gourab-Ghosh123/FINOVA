const {findAccountByUserId} = require("../repository/account.repository");

const getAccountByUserId = async(userId) => {
    const account = await findAccountByUserId(userId);

    if(!account) {
        return null;
    }
    return account;
};

module.exports = {
    getAccountByUserId
};