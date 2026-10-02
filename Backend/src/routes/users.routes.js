const express = require("express");
const router = express.Router();
const {createUserSchema , loginUserSchema} = require("../validators/user.validator");
const {validate} = require("../middleware/transfer.validation");

const {getUser , createUserControllers , loginUserController} = require("../controllers/users.controllers");

router.get("/:id" , getUser);

router.post("/" , validate(createUserSchema) , createUserControllers);

router.post("/login" , validate(loginUserSchema) , loginUserController);

module.exports = router;