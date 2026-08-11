const express = require("express");
const app = express();



app.get("/" , (req , res) => {
    res.send("welcome to our home page");
});

module.exports = app;