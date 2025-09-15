const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["delivered", "missed"],
      default: "delivered",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
