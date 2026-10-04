const {Pool} = require("pg");

const pool = new Pool({
    host : "localhost",
    port : 5432,
    database : "FINOVA",
    user : "postgres",
    password : process.env.POSTGRESQL_PASSWORD
});

module.exports = pool;