const mongoose = require("mongoose");

// standard user setup storing email, password, and what role they play in the app
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true // no duplicate accounts allowed
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String, // figuring out permissions
      enum: ["customer", "seller", "admin"], // they have to be one of these three
      default: "customer" // default to regular buyer
    },
    status: {
      type: String, // tracking if a seller account is actually allowed to sell yet
      enum: ["pending", "approved", "rejected"],
      default: "approved" // regular customers are auto-approved, sellers start as pending in the controller
    },
    company: {
      type: String, // useful if they're a brand or dealership
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);