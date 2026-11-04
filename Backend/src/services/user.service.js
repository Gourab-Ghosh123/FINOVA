const {createToken} = require("../utils/jwt");
const {findUserById , findUserByEmail , createUserRepository} = require("../repository/user.repository");
const {hashPassword , comparePassword} = require( "../utils/password");
const appError = require("../errors/AppError");
const pool = require("../config/database");
const {createAccountRepository} = require("../repository/account.repository");
//const { email } = require("zod");

const getUserById = async(userId) => {

    const user = await findUserById(userId);

    if(!user) {
        return null;
    }
    return user;
}
const createUserService = async(name , email , password) => {
    const hashedPassword = await hashPassword(password);

    let client;
    let transactionStarted = false;
    
    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        const user = await createUserRepository(client , name , email , hashedPassword);

        const account = await createAccountRepository(client , user.id);

        await client.query("COMMIT");
        transactionStarted = false;

        return user;
    }
    catch(error) {
        if(client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            }
            catch(rollbackError) {
                console.error("Transaction rollback failed" , rollbackError);
            }
        }

        if(error.code === "23505" && error.constraint === "users_email_key") {
            throw new appError("Email already registered" , 409);
        }
        
        throw error;
    }
    finally {
        if(client) {
            client.release();
        }
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