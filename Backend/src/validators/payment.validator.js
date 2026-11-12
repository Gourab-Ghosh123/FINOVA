const {z} = require("zod");

const createPaymentOrderSchema = z.object({
    accountId : z.coerce.number().int("Account Id must be an integer..").positive("Account Id must be greater than zero.."),

    amountPaise : z.number().int("Amount must be an integer").positive("Amount must be greater than zero..")
});

module.exports = {
    createPaymentOrderSchema
};