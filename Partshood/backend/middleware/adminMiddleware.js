// checking if the user hitting this route is specifically our site admin
const adminOnly = (req, res, next) => {
  // we check req.user because the authMiddleware already ran and attached it before we get here
  if (req.user && req.user.role === "admin") {
    return next(); // they have the keys to the castle
  }

  // standard error block if they are just a regular user trying to snoop
  return res.status(403).json({ message: "Admin access only" });
};

module.exports = { adminOnly };