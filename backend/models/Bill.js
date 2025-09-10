const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    deliveredDays: Number,
    missedDays: Number,
    totalAmount: Number, // deliveredDays * pricePerDay
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
