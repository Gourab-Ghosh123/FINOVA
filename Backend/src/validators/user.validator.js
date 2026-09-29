const {z} = require("zod");

const createUserSchema = z.object({
    name : z.string().min(2 , "Name must contain atleast 2 characters"),
    email : z.string().email("Invalid email address"),
    password : z.string().min(8 , "Password must contain 8 characters")
});

module.exports = {createUserSchema};