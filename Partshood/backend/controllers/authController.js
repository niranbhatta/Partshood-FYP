const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// handles making a brand new user account in the db
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, company, phone, address } = req.body;

    const existingUser = await User.findOne({ email });

    // checking if someone already signed up with this email so we don't crash
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // scramble the password before throwing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // default to customer so people can't hack the api to make themselves admins
    let assignedRole = "customer";
    if (role === "seller") {
      assignedRole = "seller";
    }

    // sellers have to wait for an admin to approve them, regulars get in instantly
    const status = assignedRole === "seller" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      status,
      // only store company name if they are actually a seller
      company: assignedRole === "seller" ? (company || "") : "",
      phone: phone || "",
      address: address || ""
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

// verifying email/password and giving back a jwt string
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // bounce them if email doesn't match
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // use bcrypt to compare plain english password to the scrambled text we saved
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // stop sellers from logging in if an admin hasn't clicked approve yet
    if (user.status === "pending") {
      return res.status(403).json({ message: "Your seller account is pending admin approval." });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your seller account application was rejected." });
    }

    // sign the token using our secret key, lasting 7 days
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

// helper route the frontend uses constantly to convert a token back into a user object
const getMe = async (req, res) => {
  try {
    // finding the user by the id we buried in the jwt, dropping the password field
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