const express = require("express");
const TransactionController = require("../controllers/transaction.controllers");
const {filterSchema} = require("../validators/transfer.validator");
const {validateQuery} = require("../middleware/transfer.validation");

const router = express.Router();

router.get("/:id" , TransactionController.getTransactionController);
router.get("/transactions" , validateQuery(filterSchema) , TransactionController.getTransactionByAccountController);

module.exports = router;