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

// 🎯 CRITICAL FIX: CORS Configuration to prevent "Access-Control-Allow-Origin" errors
const allowedOrigins = [
    // 1. Localhost origins for Expo web and bundled apps
    'http://localhost:8081',    // Expo Web Development Server
    'http://localhost:19000',   // Expo Dev Server
    'http://localhost:19006',   // Expo Dev Server (alternative port)
    
    // 2. LAN origins for testing on physical devices (replace 192.168.x.x with your local IP range)
    'http://192.168.1.x:8081',  // Example LAN IP
    'http://192.168.1.x:19000', // Example LAN IP
    
    // 3. Your deployed backend URL (optional, but harmless)
    'https://fruit-basket-mhc3.onrender.com', 
];

app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps/Postman)
      if (!origin) return callback(null, true); 

      // Allow requests from any of the explicitly defined origins
      if (allowedOrigins.some(allowed => origin.includes(allowed)) || origin.includes('192.168')) {
        return callback(null, true);
      }
      
      // Optionally, set this to true to allow *all* origins during local development:
      // return callback(null, true); 
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Required if using cookies or authentication headers
}));

app.use(express.json());

// ----------------------
// Routes
// ----------------------
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
mongoose.connect(process.env.MONGO_URI, {
  // Options are generally unnecessary in modern Mongoose
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------------
// Server listen
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});