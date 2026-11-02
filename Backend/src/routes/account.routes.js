const express = require("express");
const router = express.Router();

const {getMyAccount} = require("../controllers/account.controllers");
const {authenticate} = require("../middleware/auth");

router.get("/" , authenticate , getMyAccount);

module.exports = router;