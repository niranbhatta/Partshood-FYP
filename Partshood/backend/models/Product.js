const mongoose = require("mongoose");

// the blueprint for every part we sell in the marketplace
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true }, // longer details about fit and finish
    price: { type: Number, required: true },
    category: { type: String, required: true }, // ex: bodily parts, engine, electrical
    brand: { type: String, required: true },
    bikeModel: { type: String, required: true }, // what motorcycle this actually fits
    stock: { type: Number, required: true, default: 0 }, // inventory count
    image: { type: String, required: true }, // link to the uploaded physical image
    sellerId: {
      type: mongoose.Schema.Types.ObjectId, // matching the part back to who listed it
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, default: 0 }, // average out of 5 stars
    reviews: { type: Number, required: true, default: 0 }, // total amount of reviews 
    status: {
      type: String, // tracking if the admin has cleared this part to be shown in the public shop
      enum: ["pending", "approved", "rejected"],
      default: "pending", // new items always need an admin check first
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
