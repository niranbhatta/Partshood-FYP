const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware"); // making sure regular peeps can't hit admin endpoints
const { getSellers, createSeller, updateSellerStatus, updateSellerProfile, deleteSeller, getCustomers, createCustomer, deleteCustomer } = require("../controllers/userController");

// test route to make sure our jwt tokens actually protect endpoints
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route works",
    user: req.user
  });
});

// admin panel routes for handling shop sellers (must have jwt AND be an admin)
router.get("/sellers", protect, adminOnly, getSellers);
router.post("/sellers", protect, adminOnly, createSeller);
router.put("/sellers/:id/status", protect, adminOnly, updateSellerStatus); // approving or rejecting a seller account
router.put("/sellers/:id", protect, adminOnly, updateSellerProfile);
router.delete("/sellers/:id", protect, adminOnly, deleteSeller); // kicking a seller off the platform

// admin panel routes for managing regular customers
router.get("/customers", protect, adminOnly, getCustomers);
router.post("/customers", protect, adminOnly, createCustomer);
router.delete("/customers/:id", protect, adminOnly, deleteCustomer);

module.exports = router;