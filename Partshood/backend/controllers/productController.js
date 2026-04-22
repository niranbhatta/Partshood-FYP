const Product = require("../models/Product");
const User = require("../models/User");

// pulls all catalog items and applies search filters
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, bikeModel, name, status } = req.query;
    let query = {};

    // public/default view: customers only see things that an admin manually approved
    if (!req.user || req.user.role === 'customer') {
      query.status = 'approved';
    } else if (req.user.role === 'seller') {
      // sellers see public approved products AND their own unapproved items so they can edit them
      query.$or = [
        { status: 'approved' },
        { sellerId: req.user.id }
      ];
    } else if (req.user.role === 'admin') {
      // admins see absolutely everything, or they can filter by status to see what needs approving
      if (status) query.status = status;
    }

    // slapping on any extra search filters if they typed something into the searchbar
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (bikeModel) query.bikeModel = bikeModel;
    if (name) query.name = { $regex: name, $options: "i" };

    const products = await Product.find(query).populate("sellerId", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// fetching all unique brand names to populate the sidebar checkboxes
const getBrands = async (req, res) => {
  try {
    // grab any distinct brands currently attached to products
    const productBrands = await Product.distinct("brand");
    
    // grab any distinct company names from approved sellers
    const sellerBrands = await User.distinct("company", { role: "seller", company: { $ne: null, $ne: "" } });
    
    // merging them together while making sure we don't end up with uppercase and lowercase duplicates
    const seen = new Set();
    const allBrands = [];
    
    [...productBrands, ...sellerBrands].forEach(b => {
      if (b && !seen.has(b.toLowerCase())) {
        seen.add(b.toLowerCase());
        allBrands.push(b);
      }
    });

    allBrands.sort();
    res.json(allBrands);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch brands", error: error.message });
  }
};

// fetching unique category names like "engine" or "frame"
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    categories.sort();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

// fetching a single item for the product detail display page
const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "name email");
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// listing a new part in the catalog
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, bikeModel, stock, image } = req.body;

    // sellers are strictly locked to uploading parts that match their registered company name
    if (req.user.role === "seller") {
      const seller = await User.findById(req.user.id);
      if (seller && seller.company && brand.toLowerCase() !== seller.company.toLowerCase()) {
        return res.status(403).json({ 
          message: `You can only add products for your company brand: ${seller.company}` 
        });
      }
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      bikeModel,
      stock,
      image,
      sellerId: req.user.id,
      // if an admin creates a product, it skips the pending phase entirely
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// internal helper function checking if the current user is legally allowed to edit/delete this product
const checkProductAuth = async (req, product) => {
  // admins can touch whatever they want
  if (req.user.role === 'admin') return true;
  
  // sellers can touch it if their ID explicitly matches the seller logic
  if (product.sellerId.toString() === req.user.id) return true;
  
  if (req.user.role === 'seller') {
    const seller = await User.findById(req.user.id);
    if (seller && seller.company && product.brand.toLowerCase() === seller.company.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// rewriting details on an existing product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, bikeModel, stock, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // running our custom security check
      const isAuthorized = await checkProductAuth(req, product);
      if (!isAuthorized) {
         return res.status(401).json({ message: "Not authorized to update this product" });
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.bikeModel = bikeModel || product.bikeModel;
      if (stock !== undefined) product.stock = stock;
      product.image = image || product.image;

      // if a seller makes an edit, it resets the status back to pending so admins have to re-verify it
      if (req.user.role === 'seller') {
        product.status = 'pending';
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// removing a product forever
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const isAuthorized = await checkProductAuth(req, product);
      if (!isAuthorized) {
         return res.status(401).json({ message: "Not authorized to delete this product" });
      }
      
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

// admins formally rejecting or approving new items that sellers try to list
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.status = status;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product status", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  getCategories,
  updateProductStatus,
};
