const express = require("express");
const router = express.Router();

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    createPaymentOrderSchema
} = require("../validators/payment.validator");

const {
    validate
} = require("../middleware/transfer.validation");

const {
    createPaymentOrderController
} = require("../controllers/payment.controller");


router.post(
    "/create-order",
    authenticate,
    validate(createPaymentOrderSchema),
    createPaymentOrderController
);


module.exports = router;