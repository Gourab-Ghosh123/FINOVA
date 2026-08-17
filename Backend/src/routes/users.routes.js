const express = require("express");
const router = express.Router();


const {getUser} = require("../controllers/users.controllers");

router.get("/:id" , getUser);

module.exports = router;