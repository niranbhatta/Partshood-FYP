const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  getSellerOrders,
  updateOrderStatus,
  updateOrderToPaid,
  verifyEsewaPayment,
  deleteOrder
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { sellerOnly } = require("../middleware/sellerMiddleware"); // custom middleware for seller checks

// user checkouts and eSewa callbacks
router.post("/", protect, placeOrder);
router.post("/esewa/verify", protect, verifyEsewaPayment);
router.get("/my-orders", protect, getMyOrders); // loads exactly what the user bought

// specific dashboard data routes based on roles
router.get("/admin/all", protect, adminOnly, getAllOrders); // grabs EVERYTHING
router.get("/seller/all", protect, sellerOnly, getSellerOrders); // filters out everything except what they sell

// status updates like shifting from "pending" to "shipped"
router.put("/admin/:id", protect, adminOnly, updateOrderStatus);
router.delete("/admin/:id", protect, adminOnly, deleteOrder);
router.put("/seller/:id/status", protect, sellerOnly, updateOrderStatus);

// individual order lookups 
router.put("/:id/pay", protect, updateOrderToPaid); // mostly legacy or cash updates
router.get("/:id", protect, getSingleOrder); 

module.exports = router;