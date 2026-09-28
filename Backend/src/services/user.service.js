const {findUserById , createUserRepository} = require("../repository/user.repository");
const {hashPassword} = require( "../utils/password");

const getUserById = async(userId) => {

    const user = await findUserById(userId);

    if(!user) {
        return null;
    }
    return user;
}
const createUserService = async(name , email , password) {
    const hasedPassword = await hashPassword(password);
    const user = await createUserRepository(name , email , hasedPassword);
    return user;
}

module.exports = {
    getUserById,
    createUserService
};