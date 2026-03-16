const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

console.log("Google Auth Debug:", {
  hasClientID: !!process.env.GOOGLE_CLIENT_ID,
  clientIDPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 5) : "MISSING",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
});

// Passport Google Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Check if user exists by google_id or email
        let result = await pool.query(
          "SELECT * FROM users WHERE google_id = $1 OR LOWER(email) = LOWER($2)",
          [id, email]
        );

        let user;
        if (result.rowCount === 0) {
          // Create new user
          const created = await pool.query(
            "INSERT INTO users (email, display_name, google_id) VALUES ($1, $2, $3) RETURNING *",
            [email, displayName, id]
          );
          user = created.rows[0];
        } else {
          user = result.rows[0];
          // Update google_id if it was a local user before
          if (!user.google_id) {
            await pool.query("UPDATE users SET google_id = $1 WHERE user_id = $2", [id, user.user_id]);
            user.google_id = id;
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

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
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // insert user
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
    console.error("Signup error:", err);
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
      return res.status(401).json({ error: "No account found with this email." });
    }

    const userRow = result.rows[0];

    if (!userRow.password_hash) {
      return res.status(401).json({ error: "This account uses Google Login. Please use 'Continue with Google'." });
    }

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
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
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT for the Google user
    const token = jwt.sign(
      { userId: req.user.user_id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    
    // Pass user and token to the frontend via URL (simple implementation for prototype)
    const userJson = JSON.stringify({
      id: req.user.user_id,
      name: req.user.display_name,
      email: req.user.email
    });
    
    // Redirect to a frontend "success" page or just back to home with the data
    res.redirect(`http://localhost:8080/login?token=${token}&user=${encodeURIComponent(userJson)}`);
  }
);

// Token check
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
