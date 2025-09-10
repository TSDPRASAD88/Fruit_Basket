const express = require("express");
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

const router = express.Router();

// Generate bill for a specific customer
router.get("/generate/:customerId/:year/:month", async (req, res) => {
  try {
    const { customerId, year, month } = req.params;
    const pricePerDay = 50; // Example: 50 currency units per day

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const deliveries = await Delivery.find({
      customer: customerId,
      date: { $gte: startDate, $lte: endDate },
    });

    const deliveredDays = deliveries.filter(d => d.status === "delivered").length;
    const missedDays = deliveries.filter(d => d.status === "missed").length;
    const totalAmount = deliveredDays * pricePerDay;

    res.json({
      deliveredDays,
      missedDays,
      totalDays: deliveries.length,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating bill", error: err.message });
  }
});

module.exports = router;
