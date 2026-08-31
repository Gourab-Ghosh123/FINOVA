const express = require("express");

const router = express.Router();

const {transferSchema} = require("../validators/transfer.validator");
const validate = require("../middleware/transfer.validation");
const {createTransfer} = require("../controllers/transfer.controllers");


router.post('/' , validate(transferSchema) , createTransfer);


module.exports = router;