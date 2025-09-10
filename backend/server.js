const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Import customer routes
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const billRoutes = require("./routes/billRoutes");

dotenv.config();

const app = express();




// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/bills", billRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Fruit Basket Backend is Running 🍎🍊🍇");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
