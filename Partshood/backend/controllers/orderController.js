const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("crypto");

// handles everything when the user hits 'Checkout'
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    // bounce them if they are trying to checkout an empty cart
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    // loop through their cart to figure out if items are in stock or need preordering
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let isPreOrder = false;

      if (product.stock < item.quantity) {
        // they want more than we have, trigger the preorder workflow
        isPreOrder = true;
      } else {
        // normal checkout, physically reduce the inventory database
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

    // generating the actual document in mongo
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
    let esewaConfig = null;

    // handling third party payment gateways
    if (paymentMethod === "eSewa") {
      // generating the encrypted signature esewa requires to verify we actually sent this
      const signatureString = `total_amount=${totalAmount},transaction_uuid=${order._id},product_code=EPAYTEST`;
      const hash = crypto.createHmac('sha256', '8gBm/:&EnhH.1/q').update(signatureString).digest('base64');

      // scaffolding exactly what the frontend needs to submit to the esewa form
      esewaConfig = {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: order._id,
        product_code: 'EPAYTEST',
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: 'http://localhost:5173/payment-success',
        failure_url: 'http://localhost:5173/payment-failed',
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: hash,
        url: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
      };
    } else if (paymentMethod === "Khalti") {
      paymentUrl = `http://localhost:5173/khalti-pay/${order._id}`;
    }

    // clear out the user's cart now that the order is generated
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      paymentUrl,
      esewaConfig,
      order
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// fetching the logged in user's receipt history
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// pulling data for a specific receipt
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // making sure random users can't try and look at other people's receipts by guessing IDs
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// admin dashboard fetch for every order in the whole system
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

// fetching only the orders that contain a product listed by the current seller
const getSellerOrders = async (req, res) => {
  try {
    // first we find all products belonging to this seller
    const products = await Product.find({ sellerId: req.user.id }).select("_id");
    const productIds = products.map((p) => p._id);

    // then we find any orders that match those product IDs
    const orders = await Order.find({ "items.product": { $in: productIds } })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// admins or sellers shifting status from pending -> shipped -> delivered
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // additional security check to make sure sellers only edit orders that belong to them
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

// primarily used for manual cash on delivery completions
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || 'N/A',
        status: req.body.status || 'COMPLETED',
        update_time: new Date().toISOString()
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// the callback hook that esewa hits after a user successfully pays on their site
const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: "No data provided" });

    // esewa sends us back a weird base64 encoded string, we have to unpack it
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedData);

    if (parsedData.status !== "COMPLETE") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // linking the payment back to the original database order using uuid
    const order = await Order.findById(parsedData.transaction_uuid);

    if (order) {

      // we could add full signature verification here later for extra security

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = { // logging the exact gateway transaction code in case of refunds
        id: parsedData.transaction_code || 'N/A',
        status: parsedData.status,
        update_time: new Date().toISOString()
      };

      const updatedOrder = await order.save();
      res.json({ message: "Payment verified successfully", order: updatedOrder });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Esewa verification error", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// completely nuking a mistaken order from the database
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
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
  updateOrderStatus,
  updateOrderToPaid,
  verifyEsewaPayment,
  deleteOrder
};