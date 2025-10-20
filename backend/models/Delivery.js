const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    // Link to the Customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    
    // Delivery Details
    date: { type: Date, required: true, unique:true, index: true }, // Index for fast lookup by date
    
    // Delivery Status
    status: {
      type: String,
      // Using 'delivered' (tick) and 'absent' (cross) to match your app description
      enum: ["delivered", "absent"], 
      default: "delivered",
    },
    notes: { type: String }, // Optional field for delivery person notes
  },
  { timestamps: true }
);

// Add a compound unique index to ensure a customer's status is tracked only once per day
deliverySchema.index({ customer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Delivery", deliverySchema);