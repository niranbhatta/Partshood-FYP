const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// all of these require you to be logged in (protect middleware) since guests don't have db carts yet
router.get("/", protect, getCart);
router.post("/", protect, addToCart); // shoving a new item in
router.put("/:productId", protect, updateCartItem); // changing the counter (like going from 1 to 2)
router.delete("/:productId", protect, removeFromCart); // hitting the trash can icon

module.exports = router;