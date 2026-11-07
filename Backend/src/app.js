const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin : "http://localhost:5173",
    methods : ["GET" , "POST" , "PUT" , "DELETE"],
    allowedHeaders : ["Content-Type" , "Authorization"]
}));

const logger = require("./middleware/logger.middleware");

app.use(logger);
const errorHandler = require("./middleware/error.middleware");

app.use(express.json());


const healthRoutes = require("./routes/health.routes");

app.use("/api" , healthRoutes);

const transferRoutes = require("./routes/transfer.routes");

app.use("/api/transfer" , transferRoutes);

const transactionRoutes = require("./routes/transaction.routes");
app.use("/api/transaction" , transactionRoutes);
app.use("/api/accounts/:accountId" , transactionRoutes);


const accountRoutes = require("./routes/account.routes");
app.use("/api/accounts" , accountRoutes);

const reconcilationRoutes = require("./routes/reconcilation.routes");
app.use("/api/accounts/:accountId" , reconcilationRoutes);



const usersRoutes = require("./routes/users.routes");
app.use("/api/users" , usersRoutes);

app.get("/" , (req , res) => {
    res.send("welcome to our home page");
});

app.use(errorHandler);

module.exports = app;