const {createTransfer} = require("../services/transfer.service");

const transferControllers = (req , res) => {
    
    const result = createTransfer(req.body);

    res.status(200).json(result);
};

module.exports = {transferControllers};