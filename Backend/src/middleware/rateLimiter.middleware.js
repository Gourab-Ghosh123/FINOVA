const {rateLimit} = require("express-rate-limit");

const loginLimiter = rateLimit({

    windowMs : 15 * 60 * 1000,

    limit : 5,

    standardHeaders : true,

    legacyHeaders : true,

    message : {
        status : "error",
        message : "Too many login requests . Please try again after 15 minutes!"
    }
});

module.exports = {
    loginLimiter
};