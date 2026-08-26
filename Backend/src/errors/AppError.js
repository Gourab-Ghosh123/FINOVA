class AppError extends Error {
    constructor(message , statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}


module.exports = AppError;