const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'myuser',
  password: process.env.PG_PASSWORD || 'mypassword',
  database: process.env.PG_DATABASE || 'mydb',
});

module.exports = pool;
