const {verifyToken} = require("../utils/jwt");

const authenticate = (req , res , next) => {
    const authHeaders = req.headers.authorization;

    if(!authHeaders) {
        return res.status(401).json({
            status : "error",
            message : "Authorization headers missing.."
        });
    }
        const parts = authHeaders.split(" ");

        if(parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
            return res.status(401).json({
                status : "error",
                message : "Invalid Authorization header format"
            });
        }
        const token = parts[1];
        
        let decoded;

        try {
            decoded = verifyToken(token);
            

        }
        catch(error) {
            return res.status(401).json({
                status : "error",
                message : "Invalid or expired token"
            });
        }

        req.user = {
                id : decoded.userId
            };

        next();
}

module.exports = {
    authenticate
};