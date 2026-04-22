const mongoose = require("mongoose");

// defined the individual items inside a cart so we can group them easily
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId, // linking this item directly to a product in the db
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1 // obviously default to 1 item if they don't specify
    }
  },
  { _id: false } // we don't need a separate mongo id just for an item in a cart array
);

// the main cart schema that holds the user and their items array
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // ties the cart to a specific user
      ref: "User",
      required: true,
      unique: true // each user only gets one active cart
    },
    items: [cartItemSchema] // embedding those items we defined above right into the cart
  },
  {
    timestamps: true // automatically updates createdAt and updatedAt
  }
);

module.exports = mongoose.model("Cart", cartSchema);