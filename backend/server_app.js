const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth.routes");

// route for signup and login
app.use("/auth", authRoutes);

const eventsRoutes = require("./routes/events.routes");

// route for events
app.use("/events", eventsRoutes);

const rsvpRoutes = require("./routes/rsvp.routes");

// route for events
app.use("/rsvp", rsvpRoutes);


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

// API Status
app.get("/api/status", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

module.exports = app;
