const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/**
 * Middleware to authenticate JWT tokens from the Authorization header.
 * Expects format: Bearer <token>
 */
const authenticateToken = (req, res, next) => {

  //Allow tests to bypass real JWT verification
  if (process.env.NODE_ENV === "test") {
    req.user = { userId: 1 };
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;