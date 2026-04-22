const express = require("express");
const router = express.Router();
const { 
  createPreOrder, 
  getPreOrders, 
  updatePreOrderStatus,
  deletePreOrder 
} = require("../controllers/preOrderController");
const { protect } = require("../middleware/authMiddleware");

// routing for the root /api/preorder endpoint
router.route("/")
  .post(protect, createPreOrder) // placing a new request
  .get(protect, getPreOrders); // pulling all requests (controller handles admin vs user logic)

// routing for specific preorder ids
router.route("/:id")
  .put(protect, updatePreOrderStatus) // marking a request as accepted or restocked
  .delete(protect, deletePreOrder); // ditching a preorder

module.exports = router;
