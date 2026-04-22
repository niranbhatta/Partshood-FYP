const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const PreOrder = require("../models/PreOrder");
const Product = require("../models/Product");

// fetching all sellers for the admin dashboard table
const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-password"); // don't send back passwords
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// fetching regular buyers
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// letting the admin manually add a buyer without them signing up
const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // quick field validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      status: "approved",
      phone: phone || "",
      address: address || ""
    });
    
    res.status(201).json({
      message: "Customer account created successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        phone: customer.phone,
        address: customer.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// completely nuking a customer from the database
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);
    
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    // cascade effect: we have to clean up all their related data so we don't leave zombie records
    await Order.deleteMany({ user: id });
    await PreOrder.deleteMany({ customer: id });
    await Cart.deleteMany({ user: id });

    // finally delete the actual account
    await customer.deleteOne();
    res.status(200).json({ message: "Customer and all related data removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// admins bypassing the pending phase by creating a seller explicitly
const createSeller = async (req, res) => {
  try {
    const { name, email, password, company, phone, address } = req.body;

    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: "Name, email, password, and company are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "seller",
      status: "approved", // auto-approved since admin is making it
      company: company || "",
      phone: phone || "",
      address: address || ""
    });

    res.status(201).json({
      message: "Seller account created successfully",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        status: seller.status,
        company: seller.company,
        phone: seller.phone,
        address: seller.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// approving or rejecting people who applied to be sellers
const updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // locking down valid states
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const seller = await User.findById(id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.status = status;
    await seller.save();

    res.status(200).json({
      message: "Seller status updated successfully",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        status: seller.status,
        company: seller.company,
        phone: seller.phone,
        address: seller.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// editing a seller's personal details
const updateSellerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, phone, address, status } = req.body;

    const seller = await User.findById(id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // conditionally updating fields if they sent them
    if (name) seller.name = name;
    if (email) seller.email = email;
    if (company !== undefined) seller.company = company;
    if (phone !== undefined) seller.phone = phone;
    if (address !== undefined) seller.address = address;
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      seller.status = status;
    }

    await seller.save();

    res.status(200).json({
      message: "Seller profile updated",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        status: seller.status,
        company: seller.company,
        phone: seller.phone,
        address: seller.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// completely clearing out a seller and all their listed products
const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // cascade effect: have to delete all products they listed so the shop doesn't break
    const sellerProducts = await Product.find({ sellerId: id }).select("_id");
    const sellerProductIds = sellerProducts.map(p => p._id);
    
    // wipe related orders that contain these specific deleted products
    if (sellerProductIds.length > 0) {
      await Order.deleteMany({ "items.product": { $in: sellerProductIds } });
    }
    
    // finally wipe the products
    await Product.deleteMany({ sellerId: id });
    
    // and wipe out any preorders tied to their brand
    if (seller.company) {
      await PreOrder.deleteMany({ brand: { $regex: new RegExp(`^${seller.company}$`, 'i') } });
    }

    await seller.deleteOne();

    res.status(200).json({ message: "Seller and all related data removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSellers,
  createSeller,
  updateSellerStatus,
  updateSellerProfile,
  deleteSeller,
  getCustomers,
  createCustomer,
  deleteCustomer
};
