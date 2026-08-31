const appError = require("../errors/AppError");
const errorHandler = (error , req , res , next) => {
    console.log(error);
    if(error instanceof appError) {
        return res.status(error.statusCode).json({
            success : false,
            message : error.message
        });
        return res.status(500).json({
            success : false,
            message : "Internal Server Error"
        });
    }
}
module.exports = errorHandler;