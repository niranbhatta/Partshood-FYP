const Recommendation = require("../models/Recommendation");

// pulling all active recommendations for the homepage display
const getRecommendations = async (req, res) => {
  try {
    // sorting by newest first
    const recommendations = await Recommendation.find().sort({ createdAt: -1 });
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// letting the admin manually add a new banner/recommendation from the dashboard
const createRecommendation = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const recommendation = await Recommendation.create({
      name,
      description,
      image,
    });
    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// removing old recommendations that aren't relevant anymore
const deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }
    
    await recommendation.deleteOne();
    res.status(200).json({ message: "Recommendation removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// editing an existing recommendation (like fixing a typo or changing the image)
const updateRecommendation = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const recommendation = await Recommendation.findById(req.params.id);

    if (recommendation) {
      recommendation.name = name || recommendation.name;
      recommendation.description = description || recommendation.description;
      recommendation.image = image || recommendation.image;

      const updatedRec = await recommendation.save();
      res.status(200).json(updatedRec);
    } else {
      res.status(404).json({ message: "Recommendation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getRecommendations,
  createRecommendation,
  deleteRecommendation,
  updateRecommendation,
};
