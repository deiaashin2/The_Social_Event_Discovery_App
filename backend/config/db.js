const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

if (process.env.NODE_ENV !== "test") {
  pool.connect()
    .then(client => {
      console.log("Connected to PostgreSQL");
      client.release();
    })
    .catch(err => {
      console.error("PostgreSQL connection error:", err.message);
    });
}

module.exports = pool;