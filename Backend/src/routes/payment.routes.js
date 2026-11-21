const express = require("express");
const router = express.Router();

const {
    authenticate
} = require("../middleware/auth");

const {
    createPaymentOrderSchema,
    verifyPaymentSchema
} = require("../validators/payment.validator");

const {
    validate
} = require("../middleware/transfer.validation");

const {
    createPaymentOrderController,
    verifyPaymentController
} = require("../controllers/payment.controllers");


router.post(
    "/create-order",
    authenticate,
    validate(createPaymentOrderSchema),
    createPaymentOrderController
);


router.post(
    "/verify",
    authenticate,
    validate(verifyPaymentSchema),
    verifyPaymentController
);

module.exports = router;