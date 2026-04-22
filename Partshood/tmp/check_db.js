const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');
const Product = require('./backend/models/Product');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/partshood';

mongoose.connect(mongoUri)
  .then(async () => {
    const products = await Product.find({}, 'name brand sellerId');
    const sellers = await User.find({ role: 'seller' }, 'name email company');
    
    console.log('--- PRODUCTS ---');
    console.log(JSON.stringify(products, null, 2));
    console.log('\n--- SELLERS ---');
    console.log(JSON.stringify(sellers, null, 2));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });
