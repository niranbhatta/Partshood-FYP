const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getCategories,
  updateProductStatus
} = require("../controllers/productController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// public routes (optional auth allows us to check if they are an admin requesting hidden products, or a normal user)
router.get("/", optionalProtect, getAllProducts);
router.get("/brands", getBrands); // strictly for the sidebar filters
router.get("/categories", getCategories); // strictly for the sidebar filters

// approving or denying new parts (must be an admin to do this)
// putting this before /:id so Express doesn't think "status" is an ID
router.put("/:id/status", protect, adminOnly, updateProductStatus);

// fetch exact layout for the product detail page
router.get("/:id", getSingleProduct);

// both sellers and admins can list new inventory 
router.post("/", protect, createProduct);

// editing and deleting existing inventory (the controller handles checking if they own the part)
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;