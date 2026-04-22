const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// open routes for guests to make an account or log in
router.post("/register", registerUser);
router.post("/login", loginUser);

// you have to pass the jwt token (protect) to fetch your own profile data
router.get("/me", protect, getMe);

module.exports = router;