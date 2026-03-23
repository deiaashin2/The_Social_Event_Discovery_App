const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/auth.controller");

// Signup
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback
);

// Token check
router.get("/me", authController.getMe);

module.exports = router;
