const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/models/User');
const Product = require('../backend/models/Product');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/partshood';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB...');

    const sellers = await User.find({ role: 'seller' });
    const products = await Product.find({});

    console.log(`Found ${sellers.length} sellers and ${products.length} products.`);

    let updatedCount = 0;

    for (const product of products) {
      // Find a seller whose company matches the product brand
      const matchingSeller = sellers.find(s => 
        s.company && s.company.toLowerCase() === product.brand.toLowerCase()
      );

      if (matchingSeller) {
        if (!product.sellerId || product.sellerId.toString() !== matchingSeller._id.toString()) {
          product.sellerId = matchingSeller._id;
          await product.save();
          console.log(`Assigned [${product.name}] (${product.brand}) to seller: ${matchingSeller.name} (${matchingSeller.company})`);
          updatedCount++;
        }
      } else {
        console.log(`No seller found for brand: ${product.brand} (Product: ${product.name})`);
      }
    }

    console.log(`\nFinished! Updated ${updatedCount} products.`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
