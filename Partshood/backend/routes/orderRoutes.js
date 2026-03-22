const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.put("/admin/:id", protect, adminOnly, updateOrderStatus);
router.get("/:id", protect, getSingleOrder);

module.exports = router;