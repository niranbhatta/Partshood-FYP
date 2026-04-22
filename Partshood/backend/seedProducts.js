const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const adminId = '69c218740afa0db563b0ccaa';

const products = [
  {
    name: "Genuine GYTR Quick Shifter Kit",
    description: "Specifically engineered for the Yamaha R-series and MT-series. This kit allows for lightning-fast, clutchless upshifts, significantly improving acceleration and providing a professional track-ready feel for every ride.",
    price: 12500,
    category: "Electricals",
    brand: "Yamaha",
    bikeModel: "R15, MT-15, R3, MT-03",
    stock: 15,
    image: "/uploads/yamaha_quick_shifter.png",
    sellerId: adminId,
    status: 'approved'
  },
  {
    name: "PowerParts Ergonomic Low Seat",
    description: "Designed for riders looking for ultimate comfort without sacrificing the aggressive Duke or RC stance. This seat features high-quality foam and a narrow profile for better ground reach and superior grip during high-speed cornering.",
    price: 8500,
    category: "Body Parts",
    brand: "KTM",
    bikeModel: "Duke 200, Duke 250, Duke 390, RC Series",
    stock: 10,
    image: "/uploads/ktm_seat.png",
    sellerId: adminId,
    status: 'approved'
  },
  {
    name: "Premium Projector LED Headlight Assembly",
    description: "A major safety and aesthetic upgrade for the Pulsar and Dominar series. This high-intensity LED projector provides a sharper beam pattern and better peripheral vision, making night rides significantly safer and more comfortable.",
    price: 6500,
    category: "Electricals",
    brand: "Bajaj",
    bikeModel: "Pulsar NS/RS, Dominar 400",
    stock: 20,
    image: "/uploads/bajaj_headlight.png",
    sellerId: adminId,
    status: 'approved'
  },
  {
    name: "SC-Project Performance Exhaust (CF Series)",
    description: "Bring out the aggressive soul of your CFMoto 250SR or 450SR. This lightweight titanium exhaust system optimizes backpressure to increase horsepower while delivering a rich, racing-inspired exhaust note.",
    price: 45000,
    category: "Exhaust",
    brand: "CFMoto",
    bikeModel: "250SR, 450SR, NK Series",
    stock: 5,
    image: "/uploads/cf_moto_exhaust.png",
    sellerId: adminId,
    status: 'approved'
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    await Product.insertMany(products);
    console.log("4 Premium products added successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
