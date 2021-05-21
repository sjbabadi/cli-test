const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PW,
  host: process.env.PG_HOST || "localhost",
  port: 5432,
  database: "todos_db",
});
// console.log("connection string: ", process.env.CONNECTION_STRING);
// const pool = new Pool({
//   connectionString: process.env.CONNECTION_STRING
//})

module.exports = pool;
