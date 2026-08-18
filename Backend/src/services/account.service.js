const {findAccountByUserId} = require("../repository/acount.repository");

const getAccountByUserId = async(userId) => {
    const account = await findAccountByUserId(userId);

    if(!account) {
        return null;
    }
    return account;
}

module.exports = {
    getAccountByUserId
};