const {z} = require("zod");

const transferSchema = z.object({
    fromAccountId : z.number().int().positive(),
    toAccountId : z.number().int().positive(),
    amount : z.number().positive()
});

const filterSchema = z.object({
    status : z.enum(["SUCCESS" , "PENDING" , "FAILED"]).optional(),
    type : z.enum(["TRANSFER" , "WITHDRAWAL" , "DEPOSIT"]).optional()
});

module.exports = {
    transferSchema,
    filterSchema
};