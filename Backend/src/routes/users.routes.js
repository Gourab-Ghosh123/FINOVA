const express = require("express");
const router = express.Router();
const {createUserSchema} = require("../validators/user.validator");
const {validate} = require("../middleware/transfer.validation");

const {getUser , createUserControllers} = require("../controllers/users.controllers");

router.get("/:id" , getUser);

router.post("/" , validate(createUserSchema) , createUserControllers);

module.exports = router;