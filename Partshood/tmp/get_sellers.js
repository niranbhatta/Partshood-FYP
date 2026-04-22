const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/partshood';

mongoose.connect(mongoUri)
  .then(async () => {
    const sellers = await User.find({ role: 'seller' }, '_id name company');
    console.log('SELLERS_DATA:' + JSON.stringify(sellers));
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
