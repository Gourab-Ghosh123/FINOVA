const express = require("express");

const router = express.Router();

const transferValidation = require("../middleware/transfer.validation");
const {transferControllers} = require("../controllers/transfer.controllers");


router.post("/transfer" , transferValidation , transferControllers);

module.exports = router;