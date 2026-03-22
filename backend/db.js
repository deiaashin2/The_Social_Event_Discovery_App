const { Pool } = require('pg');

console.log("DB CONFIG:", process.env.PG_USER, process.env.PG_PORT);

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5499, // Updated default port to 5499
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "postgres",
  database: process.env.PG_DATABASE || "postgres",
});

// Test connection 
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err.message);
  });

module.exports = pool;
