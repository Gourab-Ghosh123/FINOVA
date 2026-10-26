const {getUserById , createUserService , loginUser } = require("../services/user.service");


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

const createUserControllers = async(req , res) => {
    const {name , email , password} = req.body;

    const user = await createUserService(name , email , password);

    return res.status(201).json({
        status : "success",
        data : user
    });
};

const loginUserController = async(req , res) => {

    const {email , password} = req.body;
    const result = await loginUser(email , password);
    const {user , token} = result;

    return res.status(200).json({
        success : true,
        data : {
            user : {
                id : user.id,
                name : user.name,
                email : user.email
            },
            token : token
        }
    });
};

module.exports = {
    getUser,
    createUserControllers,
    loginUserController
};