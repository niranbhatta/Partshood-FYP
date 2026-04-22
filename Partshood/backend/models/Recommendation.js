const mongoose = require("mongoose");

// building out the basic schema for our recommended products system
const recommendationSchema = new mongoose.Schema(
  {
    name: {
      type: String, // title of the recommended part
      required: true,
    },
    description: {
      type: String, // a short blurb why we recommend it
      required: true,
    },
    image: {
      type: String, // storing the visual url here
      required: true,
    },
  },
  {
    timestamps: true, // lets us sort recommendations by newest if we need to later
  }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
