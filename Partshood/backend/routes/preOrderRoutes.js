const express = require("express");
const router = express.Router();
const { 
  createPreOrder, 
  getPreOrders, 
  updatePreOrderStatus 
} = require("../controllers/preOrderController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createPreOrder)
  .get(protect, getPreOrders);

router.route("/:id")
  .put(protect, updatePreOrderStatus);

module.exports = router;
