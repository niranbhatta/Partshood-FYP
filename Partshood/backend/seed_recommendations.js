const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recommendation = require('./models/Recommendation');

dotenv.config();

const recommendations = [
  {
    name: "Genuine GYTR Quick Shifter Kit",
    description: "Lightning-fast, clutchless upshifts for your Yamaha. Specifically engineered for the R-series and MT-series to provide a professional track-ready feel and significantly improved acceleration.",
    image: "/uploads/yamaha_quick_shifter.png"
  },
  {
    name: "PowerParts Ergonomic Low Seat",
    description: "Ultimate comfort without sacrificing the aggressive KTM stance. Features high-quality foam and a narrow profile for better ground reach and superior cornering grip.",
    image: "/uploads/ktm_seat.png"
  },
  {
    name: "Premium Projector LED Headlight Assembly",
    description: "A major safety upgrade for Pulsar and Dominar series. High-intensity multi-projector LED array provides superior night visibility and a sharp, modern aesthetic.",
    image: "/uploads/bajaj_headlight.png"
  },
  {
    name: "SC-Project Performance Exhaust (CF Series)",
    description: "Aggressive racing-inspired note for the CFMoto 250SR/450SR. High-quality titanium construction reduces weight and optimizes engine backpressure for peak performance.",
    image: "/uploads/cf_moto_exhaust.png"
  }
];

const seedRecommendations = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/partshood';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Recommendations Seeding...');

    await Recommendation.deleteMany({});
    console.log('Cleared existing recommendations.');

    await Recommendation.insertMany(recommendations);
    console.log('Successfully seeded 4 premium recommendations!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding recommendations:', error);
    process.exit(1);
  }
};

seedRecommendations();
