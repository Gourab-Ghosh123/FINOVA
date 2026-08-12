const logger = (req , res , next) => {
    console.log(`${req.method} and ${req.url}`);
    next();
}

module.exports = logger;