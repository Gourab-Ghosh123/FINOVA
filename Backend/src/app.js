const express = require("express");
const app = express();

const logger = require("./middleware/logger.middleware");

app.use(logger);

app.use(express.json());

const healthRoutes = require("./routes/health.routes");

app.use("/api" , healthRoutes);

const transferRoutes = require("./routes/transfer.routes");

app.use("/api" , transferRoutes);

app.get("/" , (req , res) => {
    res.send("welcome to our home page");
});

module.exports = app;