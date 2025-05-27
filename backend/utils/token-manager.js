const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../utils/constrants");

const createToken = (id, email, role, level, expiresIn = "7d") => {
  const payload = { id, email, role, level };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = async (req, res, next) => {
  const token = req.signedCookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
    res.locals.jwtData = decoded;
    req.user = decoded; // Make user data available in req.user
    next();
  });
};

module.exports = {
  createToken,
  verifyToken,
};
