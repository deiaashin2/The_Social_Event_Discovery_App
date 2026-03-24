const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");

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

module.exports = passport;
