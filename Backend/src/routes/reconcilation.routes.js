const express = require("express");

const router = express.Router({mergeParams : true});


const {reconcileAccountControllers} = require("../controllers/reconcilation.controllers");

router.get("/reconcilation" , reconcileAccountControllers);

module.exports = router;