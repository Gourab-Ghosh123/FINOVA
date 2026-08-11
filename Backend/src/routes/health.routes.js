const express = require("express");
const router = express.Router();

const { funcHealthHealth } = require("../controllers/health.controllers");
const { router } = require("../app");

router.get("/health" , getHealth);

module.exports = router;