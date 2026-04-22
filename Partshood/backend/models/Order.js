const mongoose = require("mongoose");

// we pull out individual items into their own mini-schema so the main order object is cleaner
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId, // linking back to the main product catalog 
      ref: "Product",
      required: true
    },
    name: {
      type: String, // storing name here so if the original product is deleted, the receipt is still correct
      required: true
    },
    price: {
      type: Number, // capturing price at the time of purchase 
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    isPreOrder: {
      type: Boolean, // flagging if this item was bought while "out of stock"
      default: false
    }
  },
  { _id: false } // we don't need a separate generic id for a line item
);

// the main checkout ticket holding all the info
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // who bought it?
      ref: "User",
      required: true
    },
    items: [orderItemSchema], // dropping the array of items we defined above right here
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true }, // exact shipping street
      city: { type: String, required: true }
    },
    paymentMethod: {
      type: String, // esewa, khalti, cash, etc
      default: "Cash on Delivery"
    },
    totalAmount: {
      type: Number, // full bill after adding up everything
      required: true
    },
    isPaid: {
      type: Boolean, // did the payment gateway clear?
      default: false
    },
    paidAt: {
      type: Date // logging exact time of transaction
    },
    paymentResult: { // storing some raw logs from esewa or the payment gateway for refunds/debugging
      id: { type: String },
      status: { type: String },
      update_time: { type: String }
    },
    orderStatus: {
      type: String, // pending -> processing -> shipped -> delivered
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);