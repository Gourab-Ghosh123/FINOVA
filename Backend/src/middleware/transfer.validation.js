/* manual validation =======> Zod
const transferValidation = (req , res , next) => {
    const {amount , receiverId} = req.body;

    if(amount === undefined) {
        return res.status(400).json({
            "status" : "error" ,
            "message" : "Amount is Required!"
        });
    }

    if(typeof amount !== "number") {
        return res.status(400).json({
            "status" : "error",
            "message" : "Amount must be a Number!"
        });
    }
    if(amount <= 0) {
        return res.status(400).json({
            "status" : "error",
            "message" : "Amount must be greater than 0"        
        });
    }

    if(!receiverId) {
        return res.status(400).json({
            "status" : "error",
            "message" : "Receiver is required!"
        });
    }
    if(typeof receiverId !== "string") {
        return res.status(400).json({
            "status" : "error",
            "message" : "ReceiverId must be a String!"
        });
    }
    next();
}
module.exports = transferValidation;

*/

const validate = (schema) => {
    return (req , res , next) => {
        const result = schema.safeParse(req.body);

        if(!result.success) {
            res.status(400).json({
                status : false,
                message : "Invalid data",
                error : result.error.issues
            });
        }
        req.body = result.data;
        next();
    }
}
const validateQuery = (schema) => {
    return (req , res , next) => {
        const validatedQuery = schema.safeParse(req.query);

        if(!validatedQuery) {
            res.status(400).json({
                status : false,
                message : "Invalid data! Choose correct Status or Type..."
            });
        }
        req.query = validatedQuery;
        next();
    }
}

module.exports = {validate , validateQuery};