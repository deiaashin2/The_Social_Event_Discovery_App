const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // check existing email
    const existing = await pool.query(
      "SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // insert user (display_name maps from form.name)
    const created = await pool.query(
      `INSERT INTO users (email, display_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, display_name`,
      [email, name, passwordHash]
    );

    const userRow = created.rows[0];

    const token = jwt.sign(
      { userId: userRow.user_id, email: userRow.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      message: "User created",
      token,
      user: { id: userRow.user_id, name: userRow.display_name, email: userRow.email },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await pool.query(
      `SELECT user_id, email, display_name, password_hash
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userRow = result.rows[0];

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: userRow.user_id, email: userRow.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: userRow.user_id, name: userRow.display_name, email: userRow.email },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Token check (same as before)
router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, payload });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
