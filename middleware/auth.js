const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Change this to a secure secret in a real application

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return next({
      status: 401,
      message: "No token provided",
    });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return next({
      status: 401,
      message: "Invalid token format",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next({
      status: 401,
      message: "Invalid token",
    });
  }
};

module.exports = auth;
