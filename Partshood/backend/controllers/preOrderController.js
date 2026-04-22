const PreOrder = require("../models/PreOrder");

// handles saving a new request when a user finds "out of stock" on a product
const createPreOrder = async (req, res) => {
  try {
    const { bikeModel, partName, brand } = req.body;

    if (!bikeModel || !partName || !brand) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const preOrder = await PreOrder.create({
      customer: req.user.id, // locking the request to the currently logged in user
      bikeModel,
      partName,
      brand,
      status: "pending" // starts pending until a seller or admin accepts it
    });

    res.status(201).json(preOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// fetching requests, with logic splitting based on who is asking
const getPreOrders = async (req, res) => {
  try {
    let preOrders;

    if (req.user.role === "admin") {
      // admins get to see every request ever made
      preOrders = await PreOrder.find().populate("customer", "name email");
    } else if (req.user.role === "seller") {
      // sellers only see requests that match their exact registered company name!
      let sellerCompany = req.user.company;

      // fallback: if the jwt token doesn't have the company, double check the db
      if (!sellerCompany) {
        const User = require("../models/User");
        const user = await User.findById(req.user.id);
        sellerCompany = user?.company;
      }

      if (sellerCompany) {
        // regex search ignoring case so "yamaha" matches "YAMAHA"
        preOrders = await PreOrder.find({
          brand: { $regex: new RegExp(`^${sellerCompany}$`, 'i') }
        }).populate("customer", "name email");
      } else {
        preOrders = []; // if they don't have a company mapped, they see nothing
      }
    } else {
      // normal customers only see the preorders they specifically requested
      preOrders = await PreOrder.find({ customer: req.user.id });
    }

    res.status(200).json(preOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// admins or sellers shifting a request from pending -> accepted etc.
const updatePreOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const preOrder = await PreOrder.findById(req.params.id);

    if (!preOrder) {
      return res.status(404).json({ message: "Pre-order not found" });
    }

    // role check: making absolutely sure a seller isn't editing a competitor's preorder
    if (req.user.role === "seller") {
      let sellerCompany = req.user.company;
      if (!sellerCompany) {
        const User = require("../models/User");
        const u = await User.findById(req.user.id);
        sellerCompany = u?.company;
      }
      if (!sellerCompany || preOrder.brand.toLowerCase() !== sellerCompany.toLowerCase()) {
        return res.status(403).json({ message: "Not authorized to update this pre-order" });
      }
    }

    preOrder.status = status;
    await preOrder.save();

    res.status(200).json(preOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// deleting old or resolved preorders from the dashboard
const deletePreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findById(req.params.id);

    if (!preOrder) {
      return res.status(404).json({ message: "Pre-order not found" });
    }

    // same role check as above, sellers can only manage their own territory
    if (req.user.role === "seller") {
      let sellerCompany = req.user.company;
      if (!sellerCompany) {
        const User = require("../models/User");
        const u = await User.findById(req.user.id);
        sellerCompany = u?.company;
      }
      if (!sellerCompany || preOrder.brand.toLowerCase() !== sellerCompany.toLowerCase()) {
        return res.status(403).json({ message: "Not authorized to delete this pre-order" });
      }
    }

    await preOrder.deleteOne();
    res.status(200).json({ message: "Pre-order removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPreOrder,
  getPreOrders,
  updatePreOrderStatus,
  deletePreOrder
};
