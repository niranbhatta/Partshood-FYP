const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    return next();
  }

  return res.status(403).json({ message: "Seller access only" });
};

module.exports = { sellerOnly };
