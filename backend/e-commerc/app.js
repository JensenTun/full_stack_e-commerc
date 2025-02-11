const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/categories", require("./routes/category")); // Add category routes
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
