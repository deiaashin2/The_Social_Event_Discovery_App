require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const app = express();

app.use(cors());
app.use(express.json());

// Session and Passport initialization
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/auth.routes");

// route for signup and login
app.use("/auth", authRoutes);

const eventsRoutes = require("./routes/events.routes");

// route for events
app.use("/events", eventsRoutes);

const rsvpRoutes = require("./routes/rsvp.routes");

// route for events
app.use("/rsvp", rsvpRoutes);

const attendeesRoutes = require("./routes/attendees.routes");

// route for attendees
app.use("/events", attendeesRoutes);


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
