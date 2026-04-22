const Cart = require("../models/Cart");
const Product = require("../models/Product");

// fetches the shopping cart for whoever is logged in right now
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    // if they don't have a cart initialized yet, make an empty one on the fly
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// putting a new item in the cart array
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // hard block to prevent zero-stock items from sneaking into carts
    if (product.stock === 0) {
      return res.status(400).json({ message: "This product is out of stock. Please use the pre-order system." });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // checking if this exact product is already in their cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // just bump up the amount instead of making a duplicate row
      existingItem.quantity += quantity || 1;
    } else {
      // brand new item
      cart.items.push({
        product: productId,
        quantity: quantity || 1
      });
    }

    await cart.save();
    
    // populate before sending it back so the frontend has the image and price
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    res.status(200).json({
      message: "Item added to cart",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// handling the plus and minus buttons inside the cart page
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // overriding the old quantity
    item.quantity = quantity;

    // if they dragged the number to 0, just auto-delete it 
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (cartItem) => cartItem.product.toString() !== productId
      );
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    res.status(200).json({
      message: "Cart updated",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// hitting the explicit delete button for a specific item
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // filtering the items array to keep everything EXCEPT the one we are deleting
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    res.status(200).json({
      message: "Item removed from cart",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};