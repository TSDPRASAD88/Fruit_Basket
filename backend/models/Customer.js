const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Core Customer Data
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
    email: { type: String, trim: true, unique: true, sparse: true }, // Optional for authentication/contact

    // Business & Billing Data (Removed mealPlan and pricePerDay)
    startDate: { type: Date, default: Date.now }, // When the customer started the service
    
    // Status
    active: { type: Boolean, default: true }, // Use this to filter out paused or finished customers
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);