const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
  try {
    const { category, brand, bikeModel, name } = req.query;
    let query = {};

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

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, bikeModel, stock, image } = req.body;

    // Sellers can only add products for their registered company brand
    if (req.user.role === "seller") {
      const User = require("../models/User");
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
      sellerId: req.user.id
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, bikeModel, stock, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
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

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
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

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
