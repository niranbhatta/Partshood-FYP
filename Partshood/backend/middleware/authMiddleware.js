const jwt = require("jsonwebtoken");

// hard auth check - stops the request immediately if they aren't logged in
const protect = (req, res, next) => {
  let token = req.headers.authorization; // grab the token from the request header

  // checking if they even sent a token and if it's formatted right
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    token = token.split(" ")[1]; // strip off the 'Bearer ' part so we just have the raw token string
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decrypt it to see who this actually is
    req.user = decoded; // attach their user info to the request so controllers can use it
    next(); // push them along to the actual route
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" }); // token was fake or expired
  }
};

// soft auth check - checks if they are logged in, but lets them through either way
const optionalProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // we know who they are, attach to request
    } catch (error) {
      // the token was bad, but we just pretend they are logged out instead of blocking them
      req.user = null;
    }
  }
  next(); // always let them through
};

module.exports = { protect, optionalProtect };