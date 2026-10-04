const jwt = require("jsonwebtoken");

const createToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {expiresIn : "1h"}
    )
};

module.export = {createToken};