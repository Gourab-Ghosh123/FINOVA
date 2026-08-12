const getHealth = ((req , res) => {
    res.status(200).json({
        "status" : "success",
        "message" : "Server is alive"
    });
});

module.exports = {
    getHealth
}