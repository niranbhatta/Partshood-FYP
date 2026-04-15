const PreOrder = require("../models/PreOrder");

// @desc    Create a new pre-order
// @route   POST /api/preorder
// @access  Private (Customer)
const createPreOrder = async (req, res) => {
  try {
    const { bikeModel, partName, brand } = req.body;

    if (!bikeModel || !partName || !brand) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const preOrder = await PreOrder.create({
      customer: req.user.id,
      bikeModel,
      partName,
      brand,
      status: "pending"
    });

    res.status(201).json(preOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get pre-orders based on role
// @route   GET /api/preorder
// @access  Private
const getPreOrders = async (req, res) => {
  try {
    let preOrders;

    if (req.user.role === "admin") {
      // Admin sees ALL pre-orders
      preOrders = await PreOrder.find().populate("customer", "name email");
    } else if (req.user.role === "seller") {
      // Seller sees ONLY those matching their company brand (case-insensitive)
      let sellerCompany = req.user.company;
      
      // Fallback: If company is missing from token, fetch from DB
      if (!sellerCompany) {
        const User = require("../models/User");
        const user = await User.findById(req.user.id);
        sellerCompany = user?.company;
      }

      if (sellerCompany) {
        preOrders = await PreOrder.find({ 
          brand: { $regex: new RegExp(`^${sellerCompany}$`, 'i') } 
        }).populate("customer", "name email");
      } else {
        preOrders = [];
      }
    } else {
      // Customer sees ONLY their own
      preOrders = await PreOrder.find({ customer: req.user.id });
    }

    res.status(200).json(preOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update pre-order status
// @route   PUT /api/preorder/:id
// @access  Private (Admin/Seller)
const updatePreOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const preOrder = await PreOrder.findById(req.params.id);

    if (!preOrder) {
      return res.status(404).json({ message: "Pre-order not found" });
    }

    // Role check: Seller can only update their own brand's pre-orders
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

module.exports = {
  createPreOrder,
  getPreOrders,
  updatePreOrderStatus
};
