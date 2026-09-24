const bcrypt = require("bcrypt");

const hashPassword = async(password) => {

    const hashedPassword = await bcrypt.hash(password , 12);

    return hashedPassword;
}

const comparePassword = async(password , hashedPassword) => {

    return await bcrypt.compare(password , hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};