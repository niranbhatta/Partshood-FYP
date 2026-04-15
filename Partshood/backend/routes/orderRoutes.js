const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  getSellerOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware");

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.get("/seller/all", protect, sellerOnly, getSellerOrders);
router.put("/admin/:id", protect, adminOnly, updateOrderStatus);
router.put("/seller/:id/status", protect, sellerOnly, updateOrderStatus);
router.get("/:id", protect, getSingleOrder);

module.exports = router;