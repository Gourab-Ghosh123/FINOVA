const {getUserById} = require("../services/user.service");

const getUser = async (req , res) => {
    const userId = req.params.id;
    const user = await getUserById(userId);

    if(!user) {
        return res.status(404).json({
            status : "error",
            message : "user not found" 
        });
    }
    return res.status(200).json({
        status : "success",
        data : user
    });
}

module.exports = {
    getUser
};