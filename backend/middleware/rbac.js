const { roles } = require("../utils/constrants");

const ensureAdmin = (req, res, next) => {
  const { role } = res.locals.jwtData;
  if (role === roles.admin) {
    return ;
  }
  return res.status(403).json({ message: "Access Denied: Admins Only" });
};

module.exports = {
  ensureAdmin,
};
