const express = require("express");

const router = express.Router();

const {transferControllers} = require("../controllers/transfer.controllers");

router.post("/transfer" , transferControllers);

module.exports = router;