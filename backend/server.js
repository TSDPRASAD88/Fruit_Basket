const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Import ONLY the active routes
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const billRoutes = require("./routes/billRoutes"); 

dotenv.config();

const app = express();

// ----------------------
// Middleware
// ----------------------

// 🎯 SIMPLIFIED CORS FIX: Use the default cors() to allow all origins
// This is the simplest fix and is usually sufficient for Express APIs deployed publicly.
app.use(cors());

app.use(express.json());

// ----------------------
// Routes
// ----------------------
// CRITICAL: These routes must be correctly attached.
app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/bills", billRoutes); 

// Test route
app.get("/", (req, res) => {
  res.send("Fruit Basket Backend is Running 🍎🍊🍇");
});

// ----------------------
// MongoDB connection
// ----------------------
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------------
// Server listen
// ----------------------
// NOTE: Removed local default 8080. For deployment, rely on process.env.PORT or Render's default.
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});