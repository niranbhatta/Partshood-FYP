// protecting routes that only our approved third-party sellers should see
const sellerOnly = (req, res, next) => {
  // verifying they are officially labeled as a seller in our db setup
  if (req.user && req.user.role === "seller") {
    return next(); // let them through to manage their inventory
  }

  // bouncing back regular customers
  return res.status(403).json({ message: "Seller access only" });
};

module.exports = { sellerOnly };
