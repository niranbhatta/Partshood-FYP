const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-password");
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── Customer management ──
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
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

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }
    await customer.deleteOne();
    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin creates a seller directly — auto-approved, no pending step
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
      status: "approved",      // Admin-created sellers are instantly approved
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

const updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

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

const updateSellerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, phone, address, status } = req.body;

    const seller = await User.findById(id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

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

const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    await seller.deleteOne();

    res.status(200).json({ message: "Seller removed successfully" });
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
