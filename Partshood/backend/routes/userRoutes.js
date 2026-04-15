const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { getSellers, createSeller, updateSellerStatus, updateSellerProfile, deleteSeller, getCustomers, createCustomer, deleteCustomer } = require("../controllers/userController");

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route works",
    user: req.user
  });
});

// Admin routes for managing sellers
router.get("/sellers", protect, adminOnly, getSellers);
router.post("/sellers", protect, adminOnly, createSeller);
router.put("/sellers/:id/status", protect, adminOnly, updateSellerStatus);
router.put("/sellers/:id", protect, adminOnly, updateSellerProfile);
router.delete("/sellers/:id", protect, adminOnly, deleteSeller);

// Admin routes for managing customers
router.get("/customers", protect, adminOnly, getCustomers);
router.post("/customers", protect, adminOnly, createCustomer);
router.delete("/customers/:id", protect, adminOnly, deleteCustomer);

module.exports = router;