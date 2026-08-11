require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const connectDB = require("./db");

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const addressRoutes = require("./src/routes/addressRoutes")

const app = express();
const PORT = 3000;

// Database
connectDB();

// Global Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/address",addressRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});