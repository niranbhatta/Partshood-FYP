const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  createRecommendation,
  deleteRecommendation,
  updateRecommendation,
} = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// anyone can view the recommended items on the homepage
router.get("/", getRecommendations);

// but only admins can actually create or edit what gets recommended
router.post("/", protect, adminOnly, createRecommendation);
router.put("/:id", protect, adminOnly, updateRecommendation);
router.delete("/:id", protect, adminOnly, deleteRecommendation);

module.exports = router;
