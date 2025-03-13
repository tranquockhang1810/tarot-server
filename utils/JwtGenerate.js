const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const jwtGenerate = (user) => {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
  return accessToken;
};

module.exports = jwtGenerate;