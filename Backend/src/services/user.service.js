const {createToken} = require("../utils/jwt");
const {findUserById , findUserByEmail , createUserRepository} = require("../repository/user.repository");
const {hashPassword , comparePassword} = require( "../utils/password");
const appError = require("../errors/AppError");
const { email } = require("zod");

const getUserById = async(userId) => {

    const user = await findUserById(userId);

    if(!user) {
        return null;
    }
    return user;
}
const createUserService = async(name , email , password) => {
    const hashedPassword = await hashPassword(password);
    try {
        const user = await createUserRepository(name , email , hashedPassword);
        return user;
    }
    catch(error) {
        if(error.code === "23505" && error.constraint === "users_email_key") {
            throw new appError("Email already Registered!" , 409);
        }
        throw error;
    }
    
}

const loginUser = async(email , password) => {
    const user = await findUserByEmail(email);
    if(!user) {
        throw new appError("Invaid email or password" , 401);
    }

    const passwordMatches = await comparePassword(password , user.password_hash);

    if(!passwordMatches) {
        throw new appError("Invalid email or password" , 401);
    }

    const token = createToken(user.id);

    return {user , token};
}

module.exports = {
    getUserById,
    createUserService,
    loginUser
};