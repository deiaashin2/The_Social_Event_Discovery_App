require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected! Server time:', res.rows[0]);
    const events = await pool.query('SELECT * FROM events');
    console.log('Events found:', events.rowCount);
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await pool.end();
  }
}

test();
