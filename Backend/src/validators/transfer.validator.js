const {z} = require("zod");

const transferSchema = z.object({
    amount : z.number().positive(),
    recieverId : z.string().min(1)
});

module.exports = {
    transferSchema
};