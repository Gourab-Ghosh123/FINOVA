const {findUserbyId} = require("../repository/user.repository");

const getUserById = async(userId) => {

    const user = findUserbyId(userId);

    if(!user) {
        return null;
    }
    return user;
}

module.exports = {
    getUserById
};