const {Pool} = require("pg");

const pool = new Pool({
    host : "localhost",
    port : 5432,
    database : "FINOVA",
    user : "postgres",
    password : "11*******"
});

module.exports = pool;