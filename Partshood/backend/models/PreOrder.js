const mongoose = require("mongoose");

const preOrderSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    bikeModel: {
      type: String,
      required: true
    },
    partName: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "accepted", "rejected", "not-found"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PreOrder", preOrderSchema);
