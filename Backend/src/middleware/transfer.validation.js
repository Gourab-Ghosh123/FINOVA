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