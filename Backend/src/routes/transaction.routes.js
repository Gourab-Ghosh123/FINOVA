const express = require("express");
const TransactionController = require("../controllers/transaction.controllers");
const router = express.Router();

router.get("/:id" , TransactionController.getTransactionController);
router.get("/:accountId/transactions" , TransactionController.getTransactionByAccountController);

module.exports = router;