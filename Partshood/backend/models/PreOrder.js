const mongoose = require("mongoose");

// laying out the schema for when a user wants a part we don't have in stock
const preOrderSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId, // matching the preorder to the buyer
      required: true,
      ref: "User"
    },
    bikeModel: {
      type: String, // what bike is this for?
      required: true
    },
    partName: {
      type: String, // exact phrase or name they are searching for
      required: true
    },
    brand: {
      type: String, // yamaha, honda, etc
      required: true
    },
    status: {
      type: String, // tracking where this preorder is at in our workflow
      required: true,
      default: "pending", // always start out pending 
      enum: ["pending", "accepted", "rejected", "not-found", "restocked"] // restricting to our specific states
    }
  },
  {
    timestamps: true // keeping tracking of when they placed the request
  }
);

module.exports = mongoose.model("PreOrder", preOrderSchema);
