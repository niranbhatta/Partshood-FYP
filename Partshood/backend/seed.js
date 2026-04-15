const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await Product.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    // ── Admin Account ──────────────────────────────────────────────────
    let admin = await User.findOne({ email: "admin@partshood.com" });
    if (!admin) {
      admin = await User.create({
        name: "Partshood Admin",
        email: "admin@partshood.com",
        password: hashedPassword,
        role: "admin",
        status: "approved"
      });
      console.log("✅ Admin created: admin@partshood.com / password123");
    } else {
      // Ensure existing admin has correct status
      admin.status = "approved";
      admin.role = "admin";
      await admin.save();
      console.log("✅ Admin already exists, status ensured approved.");
    }

    // ── Customer Account ───────────────────────────────────────────────
    let customer = await User.findOne({ email: "customer@partshood.com" });
    if (!customer) {
      customer = await User.create({
        name: "Test Customer",
        email: "customer@partshood.com",
        password: hashedPassword,
        role: "customer",
        status: "approved"
      });
      console.log("✅ Customer created: customer@partshood.com / password123");
    } else {
      customer.status = "approved";
      customer.role = "customer";
      await customer.save();
      console.log("✅ Customer already exists, status ensured approved.");
    }

    // ── Yamaha Seller Account ──────────────────────────────────────────
    let yamahaSeller = await User.findOne({ email: "yamaha@partshood.com" });
    if (!yamahaSeller) {
      yamahaSeller = await User.create({
        name: "Yamaha Nepal Pvt. Ltd.",
        email: "yamaha@partshood.com",
        password: hashedPassword,
        role: "seller",
        status: "approved",
        company: "Yamaha",
        phone: "+977-9801234567",
        address: "Kathmandu, Nepal"
      });
      console.log("✅ Yamaha Seller created: yamaha@partshood.com / password123");
    } else {
      yamahaSeller.status = "approved";
      await yamahaSeller.save();
      console.log("✅ Yamaha Seller already exists, status ensured approved.");
    }

    // ── KTM Seller Account ─────────────────────────────────────────────
    let ktmSeller = await User.findOne({ email: "ktm@partshood.com" });
    if (!ktmSeller) {
      ktmSeller = await User.create({
        name: "KTM Dealer Nepal",
        email: "ktm@partshood.com",
        password: hashedPassword,
        role: "seller",
        status: "approved",
        company: "KTM",
        phone: "+977-9807654321",
        address: "Pokhara, Nepal"
      });
      console.log("✅ KTM Seller created: ktm@partshood.com / password123");
    } else {
      ktmSeller.status = "approved";
      await ktmSeller.save();
      console.log("✅ KTM Seller already exists, status ensured approved.");
    }

    // ── Bajaj Seller Account ───────────────────────────────────────────
    let bajajSeller = await User.findOne({ email: "bajaj@partshood.com" });
    if (!bajajSeller) {
      bajajSeller = await User.create({
        name: "Bajaj Motors Nepal",
        email: "bajaj@partshood.com",
        password: hashedPassword,
        role: "seller",
        status: "approved",
        company: "Bajaj",
        phone: "+977-9812345678",
        address: "Lalitpur, Nepal"
      });
      console.log("✅ Bajaj Seller created: bajaj@partshood.com / password123");
    } else {
      bajajSeller.status = "approved";
      await bajajSeller.save();
      console.log("✅ Bajaj Seller already exists, status ensured approved.");
    }

    const adminId = admin._id;
    const yamahaId = yamahaSeller._id;
    const ktmId = ktmSeller._id;
    const bajajId = bajajSeller._id;

    // ── Sample Products ────────────────────────────────────────────────
    const sampleProducts = [
      {
        name: "Yamaha R15 V3 Visor",
        description: "High quality smoke visor for R15 V3",
        price: 1500,
        category: "Body Parts",
        brand: "Yamaha",
        bikeModel: "R15",
        stock: 10,
        image: "https://placehold.co/150",
        sellerId: yamahaId,
        rating: 4.5,
        reviews: 10,
      },
      {
        name: "Yamaha FZ S Exhaust Pipe",
        description: "Performance exhaust pipe for FZ series",
        price: 3200,
        category: "Exhaust",
        brand: "Yamaha",
        bikeModel: "FZ S",
        stock: 7,
        image: "https://placehold.co/150",
        sellerId: yamahaId,
        rating: 4.3,
        reviews: 6,
      },
      {
        name: "KTM Duke 200 Brake Pad",
        description: "Original rear brake pad for Duke 200",
        price: 800,
        category: "Brakes",
        brand: "KTM",
        bikeModel: "Duke 200",
        stock: 0,
        image: "https://placehold.co/150",
        sellerId: ktmId,
        rating: 4.0,
        reviews: 5,
      },
      {
        name: "KTM Duke 390 Chain Kit",
        description: "OEM chain and sprocket kit for Duke 390",
        price: 4500,
        category: "Drivetrain",
        brand: "KTM",
        bikeModel: "Duke 390",
        stock: 4,
        image: "https://placehold.co/150",
        sellerId: ktmId,
        rating: 4.7,
        reviews: 9,
      },
      {
        name: "Pulsar 220F Headlight Assembly",
        description: "Complete projector headlight assembly",
        price: 4500,
        category: "Electricals",
        brand: "Bajaj",
        bikeModel: "Pulsar 220",
        stock: 5,
        image: "https://placehold.co/150",
        sellerId: bajajId,
        rating: 4.8,
        reviews: 12,
      },
      {
        name: "Bajaj Avenger Body Kit",
        description: "Full body fairing kit for Avenger 220",
        price: 6500,
        category: "Body Parts",
        brand: "Bajaj",
        bikeModel: "Avenger 220",
        stock: 3,
        image: "https://placehold.co/150",
        sellerId: bajajId,
        rating: 4.2,
        reviews: 4,
      },
      {
        name: "Royal Enfield Classic 350 Exhaust",
        description: "Custom chrome exhaust pipe",
        price: 3500,
        category: "Exhaust",
        brand: "Royal Enfield",
        bikeModel: "Classic 350",
        stock: 0,
        image: "https://placehold.co/150",
        sellerId: adminId,
        rating: 4.2,
        reviews: 8,
      },
      {
        name: "TVS Apache RTR 160 Chain Sprocket",
        description: "Heavy duty chain sprocket kit",
        price: 2200,
        category: "Drivetrain",
        brand: "TVS",
        bikeModel: "Apache",
        stock: 20,
        image: "https://placehold.co/150",
        sellerId: adminId,
        rating: 4.6,
        reviews: 15,
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log("✅ Sample products inserted!");

    console.log("\n─────────────────────────────────────────────");
    console.log("🚀 DATABASE SEEDED SUCCESSFULLY");
    console.log("─────────────────────────────────────────────");
    console.log("Login credentials (all passwords: password123)");
    console.log("  Admin    → admin@partshood.com");
    console.log("  Customer → customer@partshood.com");
    console.log("  Yamaha   → yamaha@partshood.com  (sells Yamaha parts)");
    console.log("  KTM      → ktm@partshood.com     (sells KTM parts)");
    console.log("  Bajaj    → bajaj@partshood.com   (sells Bajaj parts)");
    console.log("─────────────────────────────────────────────\n");

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
