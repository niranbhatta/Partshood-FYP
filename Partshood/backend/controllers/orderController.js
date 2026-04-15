const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let isPreOrder = false;

      if (product.stock < item.quantity) {
        // Pre-order flow (No stock deduction)
        isPreOrder = true;
      } else {
        // Normal order
        product.stock -= item.quantity;
        await product.save();
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        isPreOrder
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress: {
        fullName: req.user.name || "Customer",
        phone: "N/A",
        address: typeof shippingAddress === 'string' ? shippingAddress : "N/A",
        city: "N/A"
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      totalAmount
    });

    let paymentUrl = null;
    if (paymentMethod === "eSewa") {
      paymentUrl = `https://uat.esewa.com.np/epay/main?amt=${totalAmount}&pid=${order._id}&scd=EPAYTEST&su=http://localhost:5173/payment-success&fu=http://localhost:5173/payment-failed`;
    } else if (paymentMethod === "Khalti") {
      paymentUrl = `http://localhost:5173/khalti-pay/${order._id}`;
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      paymentUrl,
      order
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).select("_id");
    const productIds = products.map((p) => p._id);

    const orders = await Order.find({ "items.product": { $in: productIds } })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: check if seller owns an item in this order
    if (req.user.role === "seller") {
      const products = await Product.find({ sellerId: req.user.id }).select("_id");
      const productIds = products.map((p) => p._id.toString());
      const hasItem = order.items.some((item) => productIds.includes(item.product.toString()));
      if (!hasItem) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  getSellerOrders,
  updateOrderStatus
};