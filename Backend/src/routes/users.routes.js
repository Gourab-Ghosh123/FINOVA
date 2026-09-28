const express = require("express");
const router = express.Router();

const {getUser , createUserControllers} = require("../controllers/users.controllers");

router.get("/:id" , getUser);

router.post("/" , createUserControllers);

module.exports = router;