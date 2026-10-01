const {z} = require("zod");

const createUserSchema = z.object({
    name : z.string().min(2 , "Name must contain atleast 2 characters"),
    email : z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
    password : z.string().min(8 , "Password must contain 8 characters")
});

module.exports = {createUserSchema};