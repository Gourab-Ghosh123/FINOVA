const express = require("express");
const router = express.Router();

const {createUser} = require("../controllers/users.controllers");
const {getUser} = require("../controllers/users.controllers");

router.get("/:id" , getUser);

router.post("/" , createUser);

module.exports = router;