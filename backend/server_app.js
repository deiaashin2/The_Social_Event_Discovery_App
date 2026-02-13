const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Redis test
app.get("/redis-test", (req, res) => {
  res.json({ ok: true, value: "world" });
});

// DB test
app.get("/db-test", (req, res) => {
  res.json({ ok: true, time: new Date() });
});

module.exports = app;
