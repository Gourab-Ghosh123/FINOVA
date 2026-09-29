const {findUserById , createUserRepository} = require("../repository/user.repository");
const {hashPassword} = require( "../utils/password");
const appError = require("../errors/AppError");

const getUserById = async(userId) => {

    const user = await findUserById(userId);

    if(!user) {
        return null;
    }
    return user;
}
const createUserService = async(name , email , password) => {
    const hasedPassword = await hashPassword(password);
    try {
        const user = await createUserRepository(name , email , hasedPassword);
        return user;
    }
    catch(error) {
        if(error.code === "23505" && error.constraint === "users_email_key") {
            throw new appError("Email already Registered!" , 409);
        }
        throw error;
    }
    
}

module.exports = {
    getUserById,
    createUserService
};