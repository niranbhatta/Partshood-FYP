const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, company, phone, address } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let assignedRole = "customer";
    if (role === "seller") {
      assignedRole = "seller";
    }

    const status = assignedRole === "seller" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      status,
      company: assignedRole === "seller" ? (company || "") : "",
      phone: assignedRole === "seller" ? (phone || "") : "",
      address: assignedRole === "seller" ? (address || "") : ""
    });

    res.status(201).json({
      message: assignedRole === "seller"
        ? "Seller account created! Pending admin approval."
        : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company: user.company
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Your seller account is pending admin approval." });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your seller account application was rejected." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, company: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company: user.company
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      company: user.company
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};