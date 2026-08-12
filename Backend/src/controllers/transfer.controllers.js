const transferControllers = (req , res) => {
    console.log(req.body);

    res.status(200).json({
        "message" : "Data recieved successfully!",
        "recieved_data" : req.body
    })
};

module.exports = {transferControllers};