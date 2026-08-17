const {findUserById} = require("../repository/user.repository");

const getUserById = async(userId) => {

    const user = await findUserById(userId);

    if(!user) {
        return null;
    }
    return user;
}

module.exports = {
    getUserById
};