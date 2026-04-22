const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // custom db connector

// bringing in all our individual route files so the server knows where to send requests
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");
const preOrderRoutes = require("./routes/preOrderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

dotenv.config(); // load environment variables like jwt secret and db uri
connectDB(); // fire up the connection to mongodb

const app = express();

// standard middleware setup
app.use(cors()); // allows our react frontend to talk to this backend
app.use(express.json()); // parses incoming json payloads from post reqs

// simple health check route
app.get("/", (req, res) => {
  res.send("API is running");
});

// wiring up the base urls to the specific route files
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/preorder", preOrderRoutes);
app.use("/api/upload", uploadRoutes); // handling product images
app.use("/api/recommendations", recommendationRoutes);

// making the uploads folder publicly accessible so images load in the browser
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});