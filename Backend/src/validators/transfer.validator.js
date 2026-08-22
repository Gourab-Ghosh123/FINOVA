const {z} = require("zod");

const transferSchema = z.object({
    fromAccountId : z.number().int().positive(),
    toAccountId : z.number().int().positive(),
    amount : z.number().positive()
});

module.exports = {
    transferSchema
};