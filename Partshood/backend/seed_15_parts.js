const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const parts = [
  // YAMAHA (RESTORED ORIGINAL)
  {
    name: "Genuine GYTR Quick Shifter Kit",
    description: "Specifically engineered for the Yamaha R-series and MT-series. This kit allows for lightning-fast, clutchless upshifts, significantly improving acceleration and providing a professional track-ready feel for every ride.",
    price: 12500,
    category: "Electricals",
    brand: "Yamaha",
    bikeModel: "R15, MT-15, R3, MT-03",
    stock: 15,
    image: "/uploads/yamaha_quick_shifter.png",
    status: "approved"
  },
  {
    name: "Yamaha MT-15 Pro-Series Lever Set",
    description: "Precision engineered CNC machined levers. 6-position adjustable reach allows for a custom fit to any hand size. Finished in anodized black with Yamaha racing blue accents. Foldable design to prevent breakage during tips.",
    price: 8500,
    category: "Drivetrain",
    brand: "Yamaha",
    bikeModel: "MT-15",
    stock: 15,
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "Yamaha Carbon Fiber Tank Protector",
    description: "Genuine high-gloss carbon fiber weave. Protects your tank from zipper scratches while adding a premium race-inspired look. High-strength adhesive backing ensures it stays in place through all weather conditions.",
    price: 4500,
    category: "Body Parts",
    brand: "Yamaha",
    bikeModel: "Universal",
    stock: 25,
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },

  // KTM (RESTORED ORIGINAL)
  {
    name: "PowerParts Ergonomic Low Seat",
    description: "Designed for riders looking for ultimate comfort without sacrificing the aggressive Duke or RC stance. This seat features high-quality foam and a narrow profile for better ground reach and superior grip during high-speed cornering.",
    price: 8500,
    category: "Body Parts",
    brand: "KTM",
    bikeModel: "Duke 200, Duke 250, Duke 390, RC Series",
    stock: 10,
    image: "/uploads/ktm_seat.png",
    status: "approved"
  },
  {
    name: "KTM RC 390 Aerodynamic Smoked Windshield",
    description: "Race-derived bubble design. Deflects wind over the rider for better high-speed stability and reduced fatigue. The high-quality acrylic construction is scratch-resistant and provides crystal clear optics.",
    price: 5800,
    category: "Body Parts",
    brand: "KTM",
    bikeModel: "RC 200/390",
    stock: 12,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "KTM Orange Anodized Aluminum Chain Guard",
    description: "Lightweight and incredibly strong. Replaces the bulky plastic stock guard with a precision-cut aluminum piece. Finished in signature KTM orange anodizing to make your drivetrain stand out.",
    price: 3200,
    category: "Drivetrain",
    brand: "KTM",
    bikeModel: "Duke/RC",
    stock: 20,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },

  // BAJAJ (RESTORED ORIGINAL)
  {
    name: "Premium Projector LED Headlight Assembly",
    description: "A major safety and aesthetic upgrade for the Pulsar and Dominar series. This high-intensity LED projector provides a sharper beam pattern and better peripheral vision, making night rides significantly safer and more comfortable.",
    price: 6500,
    category: "Electricals",
    brand: "Bajaj",
    bikeModel: "Pulsar NS/RS, Dominar 400",
    stock: 20,
    image: "/uploads/bajaj_headlight.png",
    status: "approved"
  },
  {
    name: "Bajaj Dominar 400 Heavy Duty Crash Guard",
    description: "Ultimate protection for your tourer. Made from thick-walled mild steel tubes with a black powder-coated finish. Includes integrated slider pucks and auxiliary light mounting points.",
    price: 4800,
    category: "Body Parts",
    brand: "Bajaj",
    bikeModel: "Dominar 400/250",
    stock: 15,
    image: "https://images.unsplash.com/photo-1609630875171-b132137746be?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "Bajaj Pulsar Gold-Series Chain & Sprocket Kit",
    description: "Premium O-ring chain kit geared for longevity. The rear sprocket is made from high-carbon steel for maximum wear resistance. The gold-plated chain links prevent corrosion and look fantastic.",
    price: 5200,
    category: "Drivetrain",
    brand: "Bajaj",
    bikeModel: "Pulsar 150/180/220",
    stock: 40,
    image: "https://images.unsplash.com/photo-1609630875171-b132137746be?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },

  // CF MOTO (RESTORED ORIGINAL)
  {
    name: "SC-Project Performance Exhaust (CF Series)",
    description: "Bring out the aggressive soul of your CFMoto 250SR or 450SR. This lightweight titanium exhaust system optimizes backpressure to increase horsepower while delivering a rich, racing-inspired exhaust note.",
    price: 45000,
    category: "Exhaust",
    brand: "CF Moto",
    bikeModel: "250SR, 450SR, NK Series",
    stock: 5,
    image: "/uploads/cf_moto_exhaust.png",
    status: "approved"
  },
  {
    name: "CF Moto NK Series Stainless Radiator Guard",
    description: "Essential protection for your cooling system. Precision laser-cut from high-grade stainless steel with an NK-themed hexagonal pattern. Protects delicate fins from road debris without restricting airflow.",
    price: 3800,
    category: "Body Parts",
    brand: "CF Moto",
    bikeModel: "250NK / 300NK / 400NK",
    stock: 18,
    image: "https://images.unsplash.com/photo-1591123109316-0925925e0bc0?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "CF Moto CNC Rear Fender Eliminator Kit",
    description: "Transform your bike's tail section. Replaces the oversized plastic fender with a minimalist CNC aluminum bracket. Maintains mounting points for indicators and license plate lights.",
    price: 4200,
    category: "Body Parts",
    brand: "CF Moto",
    bikeModel: "150NK / 250NK / 250SR",
    stock: 22,
    image: "https://images.unsplash.com/photo-1591123109316-0925925e0bc0?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },

  // TRIUMPH
  {
    name: "Triumph Speed 400 Ceramic Brake Pads",
    description: "Exceptional stopping power for the modern classic. These ceramic pads offer superior heat dissipation, zero noise, and minimal brake dust. Designed for a consistent firm lever feel even under heavy duty street use.",
    price: 3500,
    category: "Brakes",
    brand: "Triumph",
    bikeModel: "Speed 400 / Scrambler 400X",
    stock: 50,
    image: "https://images.unsplash.com/photo-1589134719002-8884f210e6a7?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "Triumph Trident 660 Vintage Bar-end Mirrors",
    description: "The ultimate cafe-racer upgrade. Solid aluminum construction with a sleek matte finish. Convex glass provide a wider rear field of vision while eliminating the vibration seen in stock mirrors.",
    price: 14500,
    category: "Body Parts",
    brand: "Triumph",
    bikeModel: "Trident 660 / Street Triple",
    stock: 8,
    image: "https://images.unsplash.com/photo-1589134719002-8884f210e6a7?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  },
  {
    name: "Triumph Tiger Adventure Handguards",
    description: "Built for the wild. Impact-resistant plastic shells mounted on heavy-duty aluminum bars. Protects your hands from wind, rain, and trail brush during off-road exploration.",
    price: 9800,
    category: "Body Parts",
    brand: "Triumph",
    bikeModel: "Tiger 850 Sport / 900 / 1200",
    stock: 12,
    image: "https://images.unsplash.com/photo-1589134719002-8884f210e6a7?auto=format&fit=crop&q=80&w=800",
    status: "approved"
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/partshood';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const sellers = await User.find({ role: 'seller' });
    console.log(`Found ${sellers.length} sellers.`);

    const seededProducts = [];

    for (const part of parts) {
      const matchingSeller = sellers.find(s => 
        s.company && s.company.toLowerCase() === part.brand.toLowerCase()
      );

      const product = new Product({
        ...part,
        sellerId: matchingSeller ? matchingSeller._id : sellers[0]?._id 
      });

      await product.save();
      seededProducts.push(product);
      console.log(`Seeded: ${part.name} for brand: ${part.brand}`);
    }

    console.log(`Successfully restored and expanded to ${seededProducts.length} premium products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
