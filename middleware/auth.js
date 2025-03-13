const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (allowedRoles = []) => (req, res, next) => {
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

    // Nếu không yêu cầu role cụ thể (allowedRoles = []) -> Cho phép tất cả
    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return next({
        status: 403,
        message: "Forbidden: You do not have permission to access this resource",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return next({
      status: 401,
      message: "Invalid token",
    });
  }
};

module.exports = auth;
