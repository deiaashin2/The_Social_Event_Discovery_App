const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");      // password hashing
const jwt = require("jsonwebtoken");     // token signing

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// TEMP in-memory storage (swap to DB later)
// store passwordHash, never store plain password
let users = []; // { id, name, email, passwordHash }

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

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: users.length + 1,
      name,
      email,
      passwordHash,
    };

    users.push(user);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // never return passwordHash
    return res.status(201).json({
      message: "User created",
      token,
      user: { id: user.id, name: user.name, email: user.email },
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

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// token
router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-change-me"
    );

    res.json({ ok: true, payload });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});


module.exports = router;
